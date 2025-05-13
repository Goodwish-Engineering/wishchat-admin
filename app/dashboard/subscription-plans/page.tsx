"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from 'swr';
import { getSubscriptionPlans, createSubscriptionPlan } from '@/lib/api';
import { formatNumber, formatCurrency, formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/loading-spinner';
import { 
  CreditCard, 
  PlusCircle,
  Clock,
  Check,
  InfinityIcon,
  RefreshCcw,
  MessageSquare
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import logger from '@/lib/logger';
import { useAuth } from '@/lib/AuthProvider';

// Form validation schema
const planFormSchema = z.object({
  name: z.string().min(2, {
    message: "Plan name must be at least 2 characters.",
  }),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    {
      message: "Price must be a valid number.",
    }
  ),
  message_limit: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    {
      message: "Message limit must be a positive number.",
    }
  ),
  trial_days: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
    {
      message: "Trial days must be a non-negative number.",
    }
  ),
  is_active: z.boolean().default(true),
  is_lifetime: z.boolean().default(false),
  auto_reset_quota: z.boolean().default(false),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function SubscriptionPlansPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch subscription plans
  const { 
    data: plansData, 
    error, 
    isLoading,
    mutate
  } = useSWR(
    'subscription-plans',
    () => getSubscriptionPlans().then(res => res.data),
    { refreshInterval: 30000 }
  );

  // Form setup
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      price: "",
      message_limit: "",
      trial_days: "0",
      is_active: true,
      is_lifetime: false,
      auto_reset_quota: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Handle form submission
  async function onSubmit(values: PlanFormValues) {
    try {
      const planData = {
        name: values.name,
        price: parseFloat(values.price),
        message_limit: parseInt(values.message_limit),
        trial_days: parseInt(values.trial_days),
        is_active: values.is_active,
        is_lifetime: values.is_lifetime,
        auto_reset_quota: values.auto_reset_quota,
      };
      
      await createSubscriptionPlan(planData);
      
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'plan_activation',
        `Created new subscription plan: ${values.name}`,
        { planData }
      );
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      form.reset();
      
      // Refresh plans data
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Error Loading Subscription Plans</h2>
        <p className="text-muted-foreground">
          There was an error loading the subscription plans. Please try again later.
        </p>
      </div>
    );
  }

  const plans = plansData?.plans || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans for chatbots
          </p>
        </div>
        {user?.is_superuser && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                Create New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subscription Plan</DialogTitle>
                <DialogDescription>
                  Create a new subscription plan for chatbots.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Pro Plan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1000.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Limit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 10000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="trial_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trial Days</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 7" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of trial days (0 for no trial)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Make this plan available for new subscriptions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="is_lifetime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Lifetime Plan</FormLabel>
                            <FormDescription>
                              Never expires (one-time payment)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="auto_reset_quota"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Reset Quota</FormLabel>
                            <FormDescription>
                              Reset message quota automatically on renewal
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <LoadingSpinner size={16} className="mr-2" /> : null}
                      Create Plan
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? "opacity-70" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.is_lifetime 
                      ? "Lifetime Access" 
                      : `${plan.trial_days > 0 ? `${plan.trial_days} days trial + ` : ''}Subscription`
                    }
                  </CardDescription>
                </div>
                <Badge variant={plan.is_active ? "default" : "outline"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                {!plan.is_lifetime && <span className="text-muted-foreground ml-1">/ month</span>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span>{formatNumber(plan.message_limit)} messages</span>
                </div>
                
                {plan.trial_days > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>{plan.trial_days} days free trial</span>
                  </div>
                )}
                
                {plan.is_lifetime && (
                  <div className="flex items-center gap-2">
                    <InfinityIcon size={16} className="text-primary" />
                    <span>Never expires</span>
                  </div>
                )}
                
                {plan.auto_reset_quota && (
                  <div className="flex items-center gap-2">
                    <RefreshCcw size={16} className="text-primary" />
                    <span>Auto-reset quota on renewal</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(plan.created_at)}
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {plan.id}
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {plans.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <CreditCard size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Subscription Plans</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                There are no subscription plans yet. Create your first plan to get started.
              </p>
              {user?.is_superuser && (
                <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Create New Plan
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}