"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from "@/hooks/use-toast";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string | null;
  organization: number | null;
  is_owner: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = Cookies.get('auth_token');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        Cookies.remove('auth_token');
        Cookies.remove('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect based on auth status
    if (!isLoading) {
      const isAuthPage = pathname === '/login';
      
      if (!token && !isAuthPage) {
        router.push('/login');
      } else if (token && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, token, pathname, router]);

  const login = async (credentials: { login: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://wishchat.goodwish.com.np/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      
      // Save to cookies
      Cookies.set('auth_token', data.token, { expires: 7 }); // 7 days
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
      
      // Log the login action
      await logActivity('login', `User ${data.user.username} logged in`);
      
      router.push('/dashboard');
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth state
    setUser(null);
    setToken(null);
    
    // Remove cookies
    Cookies.remove('auth_token');
    Cookies.remove('user');
    
    // Redirect to login
    router.push('/login');
  };

  const logActivity = async (type: string, description: string) => {
    try {
      // In a real app, you might want to send this to an API endpoint
      // Here we're just storing it in localStorage for demonstration
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        type,
        description,
        user: user?.username || 'Unknown',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log activity', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};