import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '../../utils/cn';
import { useLocation } from 'react-router-dom';

interface PageTitle {
  [key: string]: string;
}

const PAGE_TITLES: PageTitle = {
  '/dashboard': 'Dashboard',
  '/organizations': 'Organizations',
  '/chatbots': 'Chatbots',
  '/subscriptions': 'Subscription Plans',
  '/analytics': 'Analytics & Reports',
  '/coupons': 'Coupon Codes',
  '/activity': 'Activity Logs',
  '/users': 'User Management',
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = '/' + location.pathname.split('/')[1]; // Get base path
    return PAGE_TITLES[path] || 'Dashboard';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={cn("pl-16 md:pl-64 transition-all duration-300 min-h-screen")}>
        <Header title={getPageTitle()} />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;