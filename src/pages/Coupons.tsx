import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, Plus, RefreshCw, Search, AlertCircle, PieChart,
  XCircle, Loader2, PercentCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getActiveCoupons, createCoupon } from '../api/coupons';
import SkeletonLoader from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface NewCouponFormData {
  code: string;
  discount_percent: number;
  max_usage: number;
  is_active: boolean;
}

const Coupons: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<NewCouponFormData>({
    defaultValues: {
      code: '',
      discount_percent: 15,
      max_usage: 10,
      is_active: true
    }
  });
  
  // Fetch active coupons
  const { 
    data: couponsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activeCoupons'],
    queryFn: getActiveCoupons
  });
  
  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['activeCoupons'] });
      setShowCreateForm(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create coupon');
    }
  });
  
  const onSubmit = (data: NewCouponFormData) => {
    createCouponMutation.mutate(data);
  };
  
  // Filter coupons by search term
  const filteredCoupons = couponsData?.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Coupon Codes</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>
      
      {/* Create Coupon Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Create New Coupon</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., SUMMER25"
                  {...register('code', { 
                    required: 'Coupon code is required',
                    minLength: {
                      value: 3,
                      message: 'Coupon code must be at least 3 characters'
                    }
                  })}
                />
                {errors.code && (
                  <p className="text-destructive text-sm mt-1">{errors.code.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Discount Percentage</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 25"
                  {...register('discount_percent', { 
                    required: 'Discount percentage is required',
                    min: { value: 1, message: 'Discount must be at least 1%' },
                    max: { value: 100, message: 'Discount cannot exceed 100%' }
                  })}
                />
                {errors.discount_percent && (
                  <p className="text-destructive text-sm mt-1">{errors.discount_percent.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Usage</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="e.g., 10"
                  {...register('max_usage', { 
                    required: 'Maximum usage is required',
                    min: { value: 1, message: 'Maximum usage must be at least 1' }
                  })}
                />
                {errors.max_usage && (
                  <p className="text-destructive text-sm mt-1">{errors.max_usage.message}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  {...register('is_active')}
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium">Active Coupon</label>
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
                disabled={createCouponMutation.isPending}
              >
                {createCouponMutation.isPending ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Plus className="mr-2" size={16} />
                )}
                Create Coupon
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Coupons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Ticket className="mr-2 text-primary" size={20} />
              Active Coupons
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
              <p className="text-destructive">Failed to load coupons</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No coupons match your search' : 'No active coupons found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Code</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Discount</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Usage</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Created</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div className="font-medium flex items-center">
                          <Ticket size={16} className="mr-2 text-primary" />
                          {coupon.code}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <PercentCircle size={16} className="mr-2 text-muted-foreground" />
                          {coupon.discount_percent}%
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span>{coupon.times_used} / {coupon.max_usage}</span>
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ 
                                width: `${Math.min(100, (coupon.times_used / coupon.max_usage) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(coupon.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
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

export default Coupons;