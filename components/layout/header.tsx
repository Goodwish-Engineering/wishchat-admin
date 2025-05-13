"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { ModeToggle } from '../mode-toggle';
import { Bell, User, Search } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 transition-shadow duration-200 ${
      scrolled ? 'shadow-sm' : ''
    }`}>
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="hidden md:flex mx-auto max-w-md w-full px-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-background pl-8 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <div className="py-2 px-4 text-sm text-center text-muted-foreground">
                No new notifications
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(`${user?.first_name || ''} ${user?.last_name || ''}`)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-flex">
                {user?.first_name || user?.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}