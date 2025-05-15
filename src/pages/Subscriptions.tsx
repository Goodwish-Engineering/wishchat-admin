import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tag, Trash2, Plus, Check, X, CreditCard, Infinity,
  RefreshCw, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SubscriptionPlan } from '../types';
import { 
  getSubscriptionPlans, 
  createSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '../api/subscriptions';
import SkeletonLoader from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';

interface NewPlanFormData {
  name: string;
  price: number;
  message_limit: number;
  trial_days: number;
  is_active: boolean;
  is_lifetime: boolean;
  auto_reset_quota: boolean;
}

const Subscriptions: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<NewPlanFormData>({
    defaultValues: {
      name: '',
      price: 5000,
      message_limit: 5000,
      trial_days: 7,
      is_active: true,
      is_lifetime: false,
      auto_reset_quota: false
    }
  });
  
  // Fetch subscription plans
  const { 
    data: plansData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans
  });
  
  // Create new plan mutation
  const createPlanMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      toast.success('Subscription plan created successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setShowCreateForm(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create subscription plan');
    }
  });
  
  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: number) => deleteSubscriptionPlan(planId),
    onSuccess: () => {
      toast.success('Subscription plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setPlanToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete subscription plan');
    }
  });
  
  const onSubmit = (data: NewPlanFormData) => {
    createPlanMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:text-white">
        <h1 className="text-xl font-semibold ">Subscription Plans</h1>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary flex items-center space-x-2"
        >
          {showCreateForm ? (
            <>
              <X size={16} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Create New Plan</span>
            </>
          )}
        </button>
      </div>
      
      {/* Create Plan Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Create New Subscription Plan</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Basic Plan"
                  {...register('name', { required: 'Plan name is required' })}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 5000"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                />
                {errors.price && (
                  <p className="text-destructive text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message Limit</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 5000"
                  {...register('message_limit', { 
                    required: 'Message limit is required',
                    min: { value: 100, message: 'Message limit must be at least 100' }
                  })}
                />
                {errors.message_limit && (
                  <p className="text-destructive text-sm mt-1">{errors.message_limit.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trial Days</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 7"
                  {...register('trial_days', { 
                    required: 'Trial days is required',
                    min: { value: 0, message: 'Trial days must be positive' }
                  })}
                />
                {errors.trial_days && (
                  <p className="text-destructive text-sm mt-1">{errors.trial_days.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2 flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    {...register('is_active')}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">Active Plan</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_lifetime"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    {...register('is_lifetime')}
                  />
                  <label htmlFor="is_lifetime" className="text-sm font-medium">Lifetime Plan</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_reset_quota"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    {...register('auto_reset_quota')}
                  />
                  <label htmlFor="auto_reset_quota" className="text-sm font-medium">Auto Reset Quota</label>
                </div>
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
                disabled={createPlanMutation.isPending}
              >
                {createPlanMutation.isPending ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Plus className="mr-2" size={16} />
                )}
                Create Plan
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Subscription Plans List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Available Plans</h2>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader count={3} height={50} className="mb-3" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto text-destructive mb-2" size={24} />
              <p className="text-destructive">Failed to load subscription plans</p>
            </div>
          ) : !plansData?.plans.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No subscription plans available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Plan Name</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Price</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Message Limit</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Trial Days</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Features</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plansData.plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div className="font-medium flex items-center">
                          <Tag size={16} className="mr-2 text-primary" />
                          {plan.name}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <CreditCard size={16} className="mr-2 text-muted-foreground" />
                          {formatPrice(plan.price)}
                        </div>
                      </td>
                      <td className="p-4">{plan.message_limit.toLocaleString()}</td>
                      <td className="p-4">{plan.trial_days}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {plan.is_lifetime && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                              <Infinity size={12} className="mr-1" />
                              Lifetime
                            </span>
                          )}
                          
                          {plan.auto_reset_quota && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <RefreshCw size={12} className="mr-1" />
                              Auto Reset
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setPlanToDelete(plan)}
                          className="text-destructive hover:text-destructive/80 inline-flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!planToDelete}
        title="Delete Subscription Plan"
        message={`Are you sure you want to delete the "${planToDelete?.name}" plan? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
        onConfirm={() => deletePlanMutation.mutate(planToDelete!.id)}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
};

export default Subscriptions;