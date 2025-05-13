"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import Sidebar from './sidebar';
import Header from './header';
import LoadingSpinner from '../loading-spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Auth provider will redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1 && segments[0] === 'dashboard') {
    return 'Dashboard';
  }

  if (segments.length > 1) {
    const lastSegment = segments[segments.length - 1];
    // Handle dynamic routes
    if (lastSegment.match(/^\d+$/)) {
      // If last segment is numeric, use previous segment
      const previousSegment = segments[segments.length - 2];
      return formatTitle(previousSegment) + ' Details';
    }
    return formatTitle(lastSegment);
  }

  return 'Dashboard';
}

function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}