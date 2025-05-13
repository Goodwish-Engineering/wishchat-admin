"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Users, 
  FileText,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSWRConfig } from 'swr';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cache } = useSWRConfig();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleLogout = () => {
    // Clear SWR cache when logging out
    cache.clear();
    logout();
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'Organizations',
      href: '/dashboard/organizations',
      icon: <Building2 size={20} />,
    },
    {
      title: 'Chatbots',
      href: '/dashboard/chatbots',
      icon: <MessageSquare size={20} />,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart3 size={20} />,
    },
    {
      title: 'Subscription Plans',
      href: '/dashboard/subscription-plans',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'Staff Management',
      href: '/dashboard/staff',
      icon: <Users size={20} />,
      adminOnly: true,
    },
    {
      title: 'Activity Logs',
      href: '/dashboard/logs',
      icon: <FileText size={20} />,
      adminOnly: true,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
  ];

  const filteredNavItems = navItems.filter(
    item => !item.adminOnly || (user?.is_superuser)
  );

  const sidebarClasses = cn(
    "flex flex-col bg-card border-r border-border transition-all duration-300 h-screen",
    expanded ? "w-64" : "w-20",
    mobileOpen ? "fixed inset-y-0 left-0 z-50" : "hidden md:flex"
  );

  const mobileTriggerClasses = cn(
    "md:hidden fixed bottom-4 right-4 z-50 rounded-full p-2 bg-primary text-primary-foreground shadow-lg"
  );

  return (
    <>
      {/* Mobile Trigger */}
      <Button 
        onClick={() => setMobileOpen(true)} 
        className={mobileTriggerClasses}
        size="icon"
      >
        <Menu size={24} />
      </Button>

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-border">
          <h1 className={cn("font-bold text-xl overflow-hidden transition-all", 
              expanded ? "opacity-100" : "opacity-0 w-0")}>
            WishChat
          </h1>
          
          <div className="flex items-center">
            {mobileOpen && (
              <Button 
                onClick={() => setMobileOpen(false)} 
                className="md:hidden" 
                variant="ghost" 
                size="icon"
              >
                <X size={20} />
              </Button>
            )}
            <Button 
              onClick={toggleSidebar} 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex"
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.href}>
                    <Link href={item.href} legacyBehavior>
                      <a
                        className={cn(
                          "flex items-center py-2 px-3 rounded-md hover:bg-accent transition-colors",
                          isActive ? "bg-accent text-accent-foreground" : "text-foreground"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span className={cn("transition-all", 
                            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
                          {item.title}
                        </span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center mb-4",
              expanded ? "" : "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-2">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className={cn("overflow-hidden transition-all", 
                expanded ? "opacity-100" : "opacity-0 w-0")}>
              <p className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start", expanded ? "" : "justify-center")}
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span className={cn("transition-all", 
                expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
              Log out
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}