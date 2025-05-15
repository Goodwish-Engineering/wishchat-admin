import React from 'react';
import { Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold dark:text-white"
      >
        {title}
      </motion.h1>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={20} />
        </button>
        
        <ThemeToggle className="md:hidden" />
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium dark:text-white">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.is_superuser ? 'Super Admin' : 'Staff'}
            </p>
          </div>
          
          <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;