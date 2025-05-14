import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MessageCircle, 
  Tag, 
  BarChart3, 
  ClipboardList, 
  Users, 
  FileKey, 
  ChevronLeft, 
  Menu,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center px-4 py-3 rounded-md my-1 transition-colors duration-200',
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-foreground/70 hover:text-foreground hover:bg-muted',
      )}
    >
      <span className="flex items-center">
        {React.cloneElement(icon as React.ReactElement, { 
          size: 20,
          className: cn(
            'min-w-[20px]',
            isActive ? 'text-primary' : 'text-foreground/70'
          )
        })}
      </span>
      
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="ml-3"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  const isSuperAdmin = user?.is_superuser;

  return (
    <aside 
      className={cn(
        'fixed top-0 left-0 h-full z-30 bg-card border-r border-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center p-4 h-16 border-b border-border">
          {!collapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-primary flex-1"
            >
              WishChat
            </motion.h1>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" collapsed={collapsed} />
          <SidebarLink to="/organizations" icon={<Building2 />} label="Organizations" collapsed={collapsed} />
          <SidebarLink to="/chatbots" icon={<MessageCircle />} label="Chatbots" collapsed={collapsed} />
          <SidebarLink to="/subscriptions" icon={<Tag />} label="Subscriptions" collapsed={collapsed} />
          <SidebarLink to="/analytics" icon={<BarChart3 />} label="Analytics" collapsed={collapsed} />
          <SidebarLink to="/coupons" icon={<FileKey />} label="Coupons" collapsed={collapsed} />
          
          {isSuperAdmin && (
            <>
              <SidebarLink to="/activity" icon={<ClipboardList />} label="Activity Logs" collapsed={collapsed} />
              <SidebarLink to="/users" icon={<Users />} label="Users" collapsed={collapsed} />
            </>
          )}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={logout}
              className="text-sm text-destructive hover:text-destructive/90 transition-colors"
            >
              Logout
            </motion.button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;