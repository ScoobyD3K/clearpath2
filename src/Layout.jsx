import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, CreditCard, TrendingUp, DollarSign, Bell, BarChart3 } from "lucide-react";
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">DebtFree</h2>
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
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === url ? 'bg-blue-100 text-blue-700 shadow-sm' : ''
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

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors md:hidden" />
                <h1 className="text-xl font-bold text-slate-900 md:hidden">DebtFree</h1>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <NotificationBell />
                {user && (
                  <Link to={createPageUrl("Profile")}>
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
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

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}