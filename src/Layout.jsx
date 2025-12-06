import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, CreditCard, TrendingUp, DollarSign, Bell, BarChart3, Target, Calendar } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NotificationBell from "./components/layout/NotificationBell";
import { base44 } from "@/api/base44Client";

const defaultNavigationItems = [
  {
    title: "Dashboard",
    page: "Dashboard",
    icon: "LayoutDashboard",
    visible: true,
  },
  {
    title: "My Debts",
    page: "Debts",
    icon: "CreditCard",
    visible: true,
  },
  {
    title: "Financial Goals",
    page: "Goals",
    icon: "Target",
    visible: true,
  },
  {
    title: "Calendar",
    page: "Calendar",
    icon: "Calendar",
    visible: true,
  },
  {
    title: "Payoff Strategy",
    page: "Strategy",
    icon: "TrendingUp",
    visible: true,
  },
  {
    title: "Payment History",
    page: "PaymentHistory",
    icon: "DollarSign",
    visible: true,
  },
  {
    title: "Statistics",
    page: "Statistics",
    icon: "BarChart3",
    visible: true,
  },
  {
    title: "Notifications",
    page: "Notifications",
    icon: "Bell",
    visible: true,
  },
  {
    title: "Profile",
    page: "Profile",
    icon: "DollarSign",
    visible: true,
  },
];

const iconMap = {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  BarChart3,
  Bell,
  DollarSign,
  Target,
  Calendar,
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [navigationItems, setNavigationItems] = useState(defaultNavigationItems);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserNav = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData?.custom_navigation && userData.custom_navigation.length > 0) {
          setNavigationItems(userData.custom_navigation.filter(item => item.visible));
        }
      } catch (error) {
        // User not logged in or error fetching, use default
      }
    };
    fetchUserNav();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Glassmorphism Background */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
            backgroundAttachment: 'fixed'
          }}
        />

        <Sidebar className="backdrop-blur-md fixed left-0 top-0 h-screen z-10" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box'
      }}>
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">ClearPath</h2>
                <p className="text-xs text-slate-500">Financial Freedom Tracker</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const url = createPageUrl(item.page);
                    return (
                      <SidebarMenuItem key={item.page}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === url ? 'bg-cyan-100 text-cyan-700 shadow-sm' : ''
                          }`}
                        >
                          <Link to={url} className="flex items-center gap-3 px-3 py-2.5">
                            {Icon && <Icon className="w-5 h-5" />}
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10">
          <header className="backdrop-blur-md px-6 py-4 fixed top-0 right-0 left-0 z-20 shadow-sm" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          marginLeft: 'var(--sidebar-width, 256px)'
        }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors md:hidden" />
                <h1 className="text-xl font-bold text-slate-900 md:hidden">ClearPath</h1>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <NotificationBell />
                {user && (
                  <Link to={createPageUrl("Profile")}>
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200 hover:border-cyan-400 transition-colors cursor-pointer shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
                        <span className="text-white text-sm font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto" style={{ paddingTop: '73px' }}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}