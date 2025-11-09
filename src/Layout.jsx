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
      <div className="min-h-screen flex w-full relative">
        {/* Beach Background */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
        </div>

        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-md relative z-10">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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
          <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
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

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}