import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Users, Shield, Search, Plus, RefreshCw, CheckCircle2,
  XCircle, AlertCircle, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminUsers, createStaff, updateProfile } from '../api/auth';
import SkeletonLoader from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface NewStaffFormData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<NewStaffFormData>();
  
  // Fetch admin users
  const { 
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsers
  });
  
  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      toast.success('Staff member created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setShowCreateForm(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create staff member');
    }
  });
  
  const onSubmit = (data: NewStaffFormData) => {
    createStaffMutation.mutate(data);
  };
  
  // Filter users by search term
  const filteredUsers = usersData?.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">User Management</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <UserPlus size={16} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>
      
      {/* Create Staff Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Create New Staff Member</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="email@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="username"
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    }
                  })}
                />
                {errors.username && (
                  <p className="text-destructive text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="First name"
                  {...register('first_name', { required: 'First name is required' })}
                />
                {errors.first_name && (
                  <p className="text-destructive text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Last name"
                  {...register('last_name', { required: 'Last name is required' })}
                />
                {errors.last_name && (
                  <p className="text-destructive text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createStaffMutation.isPending}
              >
                {createStaffMutation.isPending ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <UserPlus className="mr-2" size={16} />
                )}
                Create Staff
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2 text-primary" size={20} />
              Administrators & Staff
            </h2>
            
            <button 
              onClick={() => refetch()}
              className="btn btn-outline p-2"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader count={3} height={50} className="mb-3" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto text-destructive mb-2" size={24} />
              <p className="text-destructive">Failed to load users</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Username</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Email</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                    {/* <th className="p-4 text-left font-medium text-muted-foreground">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Shield size={16} className={`mr-1 ${user.is_superuser ? 'text-amber-500' : 'text-blue-500'}`} />
                          <span>{user.is_superuser ? 'Super Admin' : 'Staff'}</span>
                        </div>
                      </td>
                      {/* <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.is_active 
                            ? <CheckCircle2 size={12} className="mr-1" /> 
                            : <XCircle size={12} className="mr-1" />
                          }
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UsersPage;