import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

import logoImage from '../assets/wishchatlogo.png';
import ThemeToggle from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

interface LoginFormInputs {
  login: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormInputs>();
  
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setIsLoading(true);
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
           <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
      <img 
        src={logoImage} 
        alt="Custom Logo" 
        width={48} 
        height={48}
      />
    </div>
          <h1 className="text-2xl font-bold">WishChat Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Login to access the dashboard</p>
        </div>
        
        <div className="card">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="login" className="block text-sm font-medium mb-1">
                    Username or Email
                  </label>
                  <input
                    id="login"
                    type="text"
                    className="input"
                    placeholder="Enter your username or email"
                    {...register('login', { required: 'Username or email is required' })}
                  />
                  {errors.login && (
                    <p className="text-destructive text-sm mt-1">{errors.login.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
        

      </motion.div>
    </div>
  );
};

export default Login;