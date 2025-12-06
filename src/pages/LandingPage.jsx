import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Target, TrendingUp, Calendar, BarChart3, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = createPageUrl("Dashboard");
    } else {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Payoff Strategies",
      description: "Choose between Avalanche and Snowball methods to eliminate debt faster"
    },
    {
      icon: Target,
      title: "Financial Goals",
      description: "Set and track savings goals with visual progress monitoring"
    },
    {
      icon: Calendar,
      title: "Payment Calendar",
      description: "Never miss a payment with our intuitive calendar system"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track your progress with comprehensive statistics and insights"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Make payments and adjustments with just a few clicks"
    },
    {
      icon: DollarSign,
      title: "Total Control",
      description: "Manage all your debts and finances in one beautiful dashboard"
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
            Welcome to <span className="text-cyan-600">ClearPath</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Your personal companion on the journey to financial freedom. Track debts, set goals, and watch your progress grow.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="backdrop-blur-md hover:shadow-lg transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box'
              }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div 
          className="mt-16 p-8 md:p-12 rounded-2xl text-center backdrop-blur-md"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have taken the first step towards financial freedom. Start tracking your debts and achieving your goals today.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}