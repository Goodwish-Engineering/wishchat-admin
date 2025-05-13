"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  getOrganizationChatbots,
  getChatbotTokenUsage,
  updateChatbotMessageLimit,
  updateChatbotGracePeriod,
  updateChatbotSendingStatus,
  addTemporaryBoost,
  setLifetimePlan,
  revokeLifetimePlan,
  getChatbotPayments
} from '@/lib/api';
import { formatNumber, formatDate, getCurrentMonthYear, formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import LoadingSpinner from '@/components/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from "@/hooks/use-toast";
import logger from '@/lib/logger';
import { useAuth } from '@/lib/AuthProvider';
import {
  ArrowLeft,
  MessageSquare,
  Zap,
  ClipboardCheck,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  InfinityIcon,
  Rocket,
  Check,
  XCircle,
  CreditCard,
  RefreshCcw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function ChatbotDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const chatbotId = parseInt(params.id);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [isUpdating, setIsUpdating] = useState(false);
  const [messageLimit, setMessageLimit] = useState<number | ''>('');
  const [gracePeriod, setGracePeriod] = useState<number | ''>('');
  const [boostAmount, setBoostAmount] = useState<number | ''>('');
  
  // Find the organization for this chatbot
  const { 
    data: organizationData, 
    error: organizationError,
    isLoading: organizationLoading,
    mutate: mutateOrganization
  } = useSWR(
    `chatbot-org-${chatbotId}`,
    async () => {
      // We need to find which organization has this chatbot
      const overviewResponse = await fetch('https://wishchat.goodwish.com.np/auth/organization-overview', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      });
      
      if (!overviewResponse.ok) throw new Error('Failed to fetch organizations');
      
      const data = await overviewResponse.json();
      
      // Find which organization has this chatbot
      for (const org of data.organizations) {
        const chatbot = org.chatbots.find((c: any) => c.id === chatbotId);
        if (chatbot) {
          // Now get the detailed information for this chatbot
          const chatbotsResponse = await getOrganizationChatbots(org.id);
          return chatbotsResponse.data;
        }
      }
      
      throw new Error('Chatbot not found in any organization');
    },
    { refreshInterval: 30000 }
  );

  // Fetch chatbot token usage
  const { 
    data: tokenData, 
    error: tokenError, 
    isLoading: tokenLoading,
    mutate: mutateTokenData
  } = useSWR(
    `chatbot-tokens-${chatbotId}-${currentMonth}`,
    () => getChatbotTokenUsage(chatbotId, currentMonth).then(res => res.data),
    { refreshInterval: 30000 }
  );

  // Fetch payment history
  const {
    data: paymentData,
    error: paymentError,
    isLoading: paymentLoading,
    mutate: mutatePaymentData
  } = useSWR(
    `chatbot-payments-${chatbotId}`,
    () => getChatbotPayments(chatbotId).then(res => res.data),
    { refreshInterval: 30000 }
  );

  const isLoading = organizationLoading || tokenLoading || paymentLoading;
  const hasError = organizationError || tokenError || paymentError;

  // Find the chatbot from the organization data
  const chatbot = organizationData?.Chatbots?.find((c: any) => c.id === chatbotId);

  // Set initial state for form fields based on chatbot data
  useState(() => {
    if (chatbot) {
      setMessageLimit(chatbot.quota.message_limit);
      setGracePeriod(chatbot.quota.grace_period_days);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (hasError || !chatbot) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Error Loading Chatbot Details</h2>
        <p className="text-muted-foreground mb-4">
          {hasError ? 'There was an error loading the chatbot data.' : 'Chatbot not found.'}
        </p>
        <Button onClick={() => router.push('/dashboard/chatbots')}>
          Back to Chatbots
        </Button>
      </div>
    );
  }

  // Handler for updating message limit
  const handleUpdateMessageLimit = async () => {
    if (messageLimit === '' || messageLimit <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid message limit",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateChatbotMessageLimit(chatbotId, Number(messageLimit));
      toast({
        title: "Success",
        description: "Message limit updated successfully",
      });
      mutateOrganization();
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'plan_update',
        `Updated message limit for chatbot #${chatbotId} to ${messageLimit}`,
        { chatbotId, chatbotName: chatbot.name, newLimit: messageLimit }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message limit",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for updating grace period
  const handleUpdateGracePeriod = async () => {
    if (gracePeriod === '' || gracePeriod < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid grace period",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateChatbotGracePeriod(chatbotId, Number(gracePeriod));
      toast({
        title: "Success",
        description: "Grace period updated successfully",
      });
      mutateOrganization();
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'setting_changed',
        `Updated grace period for chatbot #${chatbotId} to ${gracePeriod} days`,
        { chatbotId, chatbotName: chatbot.name, gracePeriod }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grace period",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for adding temporary message boost
  const handleAddTemporaryBoost = async () => {
    if (boostAmount === '' || boostAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid boost amount",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await addTemporaryBoost(chatbotId, Number(boostAmount));
      toast({
        title: "Success",
        description: `Added ${boostAmount} temporary messages`,
      });
      mutateOrganization();
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'boost_added',
        `Added ${boostAmount} temporary message boost to chatbot #${chatbotId}`,
        { chatbotId, chatbotName: chatbot.name, boostAmount }
      );
      
      // Clear the input field
      setBoostAmount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add temporary boost",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for updating sending status
  const handleUpdateSendingStatus = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await updateChatbotSendingStatus(chatbotId, enabled);
      toast({
        title: "Success",
        description: `Message sending ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      mutateOrganization();
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'setting_changed',
        `${enabled ? 'Enabled' : 'Disabled'} message sending for chatbot #${chatbotId}`,
        { chatbotId, chatbotName: chatbot.name, enabled }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sending status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for toggling lifetime status
  const handleToggleLifetime = async (setLifetime: boolean) => {
    setIsUpdating(true);
    try {
      if (setLifetime) {
        await setLifetimePlan(chatbotId);
        toast({
          title: "Success",
          description: "Lifetime plan assigned successfully",
        });
      } else {
        await revokeLifetimePlan(chatbotId);
        toast({
          title: "Success",
          description: "Lifetime plan revoked successfully",
        });
      }
      mutateOrganization();
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'plan_activation',
        `${setLifetime ? 'Assigned' : 'Revoked'} lifetime plan for chatbot #${chatbotId}`,
        { chatbotId, chatbotName: chatbot.name, lifetime: setLifetime }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${setLifetime ? 'assign' : 'revoke'} lifetime plan`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if the quota is getting low
  const isQuotaLow = chatbot.quota.messages_used / chatbot.quota.message_limit > 0.8;

  // Generate mock monthly data for the chart (since we don't have historical data)
  const monthlyTokenData = [
    { month: 'Jan', inputTokens: 12500, outputTokens: 1200 },
    { month: 'Feb', inputTokens: 17800, outputTokens: 1500 },
    { month: 'Mar', inputTokens: 24300, outputTokens: 2100 },
    { month: 'Apr', inputTokens: tokenData?.input_tokens || 30000, outputTokens: tokenData?.output_tokens || 2800 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center gap-2"
          onClick={() => router.push('/dashboard/chatbots')}
        >
          <ArrowLeft size={16} />
          Back to Chatbots
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{chatbot.name}</h1>
            <p className="text-muted-foreground">
              ID: {chatbot.id} | Organization: <Link href={`/dashboard/organizations/${chatbot.organization.id}`} className="hover:underline">{chatbot.organization.name}</Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={chatbot.quota.can_send_message ? "default" : "destructive"}>
              {chatbot.quota.can_send_message ? "Active" : "Inactive"}
            </Badge>
            {chatbot.quota.is_trial && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                Trial
              </Badge>
            )}
            {chatbot.quota.is_paid && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Paid
              </Badge>
            )}
            {chatbot.quota.is_trial_valid === false && chatbot.quota.is_subscription_valid === false && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Messages Used</h3>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-3xl font-bold">{formatNumber(chatbot.quota.messages_used)}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Usage</span>
                  <span>{Math.round((chatbot.quota.messages_used / chatbot.quota.message_limit) * 100)}%</span>
                </div>
                <Progress 
                  value={(chatbot.quota.messages_used / chatbot.quota.message_limit) * 100} 
                  className={`h-2 ${isQuotaLow ? "bg-amber-200 dark:bg-amber-900" : ""}`}
                  indicatorClassName={isQuotaLow ? "bg-amber-500" : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Limit: {formatNumber(chatbot.quota.message_limit)}
                  {chatbot.quota.temporary_message_boost > 0 && (
                    <span className="ml-1">
                      (+{formatNumber(chatbot.quota.temporary_message_boost)} boost)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Token Usage</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{formatNumber(tokenData?.total_tokens || 0)}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Input:</span>
                  <span>{formatNumber(tokenData?.input_tokens || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Output:</span>
                  <span>{formatNumber(tokenData?.output_tokens || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Subscription Status</h3>
            </div>
            <div className="mt-3 space-y-1">
              {chatbot.quota.is_trial && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className={chatbot.quota.is_trial_valid ? "text-green-500" : "text-red-500"} />
                  <span className={chatbot.quota.is_trial_valid ? "text-green-500" : "text-red-500"}>
                    Trial {chatbot.quota.is_trial_valid ? "Active" : "Expired"}
                  </span>
                </div>
              )}
              {chatbot.quota.is_paid && (
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-green-500" />
                  <span className="text-green-500">
                    Paid Subscription
                  </span>
                </div>
              )}
              {!chatbot.quota.is_trial && !chatbot.quota.is_paid && (
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-red-500">
                    No active subscription
                  </span>
                </div>
              )}
              
              {/* Valid through date */}
              {chatbot.quota.is_trial_valid && (
                <p className="text-sm">
                  Trial valid until: {formatDate(chatbot.quota.trial_end_date)}
                </p>
              )}
              {chatbot.quota.is_subscription_valid && chatbot.quota.subscription_end_date && (
                <p className="text-sm">
                  Subscription valid until: {formatDate(chatbot.quota.subscription_end_date)}
                </p>
              )}
              
              {/* Grace period */}
              {chatbot.quota.grace_period_days > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <span className="text-amber-500">
                    Grace period: {chatbot.quota.grace_period_days} days
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Details */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>
            API details for integration with the chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">API Key</h4>
              <div className="flex items-center gap-2">
                <Input 
                  value={chatbot.api_key} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(chatbot.api_key);
                    toast({
                      title: "Copied",
                      description: "API key copied to clipboard",
                    });
                  }}
                >
                  <ClipboardCheck size={16} />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Azure Index Name</h4>
              <div className="flex items-center gap-2">
                <Input 
                  value={chatbot.azure_index_name} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(chatbot.azure_index_name);
                    toast({
                      title: "Copied",
                      description: "Azure index name copied to clipboard",
                    });
                  }}
                >
                  <ClipboardCheck size={16} />
                </Button>
              </div>
            </div>
            
            {chatbot.domain_name && (
              <div>
                <h4 className="text-sm font-medium mb-1">Domain Name</h4>
                <Input 
                  value={chatbot.domain_name} 
                  readOnly
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Content */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Quota & Settings</TabsTrigger>
          <TabsTrigger value="analytics">Token Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Quota</CardTitle>
                <CardDescription>
                  Manage message limits and temporary boosts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="messageLimit" className="text-sm font-medium">Message Limit</label>
                    <div className="flex gap-2">
                      <Input
                        id="messageLimit"
                        type="number"
                        value={messageLimit}
                        onChange={(e) => setMessageLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="Enter new message limit"
                      />
                      <Button onClick={handleUpdateMessageLimit} disabled={isUpdating}>
                        {isUpdating ? <LoadingSpinner size={16} /> : "Update"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current limit: {formatNumber(chatbot.quota.message_limit)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label htmlFor="boostAmount" className="text-sm font-medium">Add Temporary Message Boost</label>
                    <div className="flex gap-2">
                      <Input
                        id="boostAmount"
                        type="number"
                        value={boostAmount}
                        onChange={(e) => setBoostAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="Enter number of messages"
                      />
                      <Button onClick={handleAddTemporaryBoost} disabled={isUpdating}>
                        {isUpdating ? <LoadingSpinner size={16} /> : <Rocket size={16} className="mr-2" />}
                        Boost
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current boost: {formatNumber(chatbot.quota.temporary_message_boost)} additional messages
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Settings</CardTitle>
                <CardDescription>
                  Manage subscription and activation settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Message Sending</label>
                      <p className="text-xs text-muted-foreground">
                        Enable or disable message sending
                      </p>
                    </div>
                    <Switch
                      checked={chatbot.quota.is_sending_enabled}
                      onCheckedChange={handleUpdateSendingStatus}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label htmlFor="gracePeriod" className="text-sm font-medium">Grace Period (Days)</label>
                    <div className="flex gap-2">
                      <Input
                        id="gracePeriod"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="Enter grace period in days"
                      />
                      <Button onClick={handleUpdateGracePeriod} disabled={isUpdating}>
                        {isUpdating ? <LoadingSpinner size={16} /> : "Update"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current grace period: {chatbot.quota.grace_period_days} days
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lifetime Plan</label>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={chatbot.quota.is_lifetime
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-muted"
                        }
                      >
                        {chatbot.quota.is_lifetime 
                          ? <Check size={14} className="mr-1" /> 
                          : <XCircle size={14} className="mr-1" />
                        }
                        {chatbot.quota.is_lifetime ? "Lifetime Active" : "Lifetime Inactive"}
                      </Badge>
                      <Button 
                        variant={chatbot.quota.is_lifetime ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleLifetime(!chatbot.quota.is_lifetime)}
                        disabled={isUpdating}
                      >
                        {isUpdating 
                          ? <LoadingSpinner size={16} /> 
                          : chatbot.quota.is_lifetime 
                            ? "Revoke Lifetime" 
                            : <><InfinityIcon size={16} className="mr-2" /> Assign Lifetime</>
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {chatbot.quota.is_lifetime
                        ? "Chatbot has a lifetime plan with unlimited access"
                        : "Assign a lifetime plan to provide unlimited access"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Token Usage Analytics</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Month:</span>
                  <Select
                    value={currentMonth}
                    onValueChange={setCurrentMonth}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-04">April 2025</SelectItem>
                      <SelectItem value="2025-03">March 2025</SelectItem>
                      <SelectItem value="2025-02">February 2025</SelectItem>
                      <SelectItem value="2025-01">January 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                Token usage analysis for {chatbot.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                      <h3 className="text-3xl font-bold">{formatNumber(tokenData?.total_tokens || 0)}</h3>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Input Tokens</p>
                      <h3 className="text-3xl font-bold">{formatNumber(tokenData?.input_tokens || 0)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(((tokenData?.input_tokens || 0) / (tokenData?.total_tokens || 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Output Tokens</p>
                      <h3 className="text-3xl font-bold">{formatNumber(tokenData?.output_tokens || 0)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(((tokenData?.output_tokens || 0) / (tokenData?.total_tokens || 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Monthly Token Usage</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyTokenData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value as number)} />
                        <Legend />
                        <Bar dataKey="inputTokens" name="Input Tokens" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="outputTokens" name="Output Tokens" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Token Usage Trend</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyTokenData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value as number)} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="inputTokens" 
                          name="Input Tokens"
                          stackId="1"
                          stroke="hsl(var(--chart-1))" 
                          fill="hsl(var(--chart-1))" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="outputTokens" 
                          name="Output Tokens"
                          stackId="1"
                          stroke="hsl(var(--chart-2))" 
                          fill="hsl(var(--chart-2))" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing History Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Payment and subscription history for {chatbot.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Current Subscription */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Current Subscription</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {chatbot.quota.is_lifetime ? (
                        <div className="flex items-center gap-2">
                          <InfinityIcon size={20} className="text-green-500" />
                          <div>
                            <h4 className="font-medium">Lifetime Plan</h4>
                            <p className="text-sm text-muted-foreground">Never expires</p>
                          </div>
                        </div>
                      ) : chatbot.quota.is_paid ? (
                        <div className="flex items-center gap-2">
                          <CreditCard size={20} className="text-green-500" />
                          <div>
                            <h4 className="font-medium">Paid Subscription</h4>
                            <p className="text-sm text-muted-foreground">
                              Valid until: {formatDate(chatbot.quota.subscription_end_date || '')}
                            </p>
                          </div>
                        </div>
                      ) : chatbot.quota.is_trial ? (
                        <div className="flex items-center gap-2">
                          <Clock size={20} className={chatbot.quota.is_trial_valid ? "text-green-500" : "text-red-500"} />
                          <div>
                            <h4 className="font-medium">Trial Plan</h4>
                            <p className="text-sm text-muted-foreground">
                              {chatbot.quota.is_trial_valid
                                ? `Valid until: ${formatDate(chatbot.quota.trial_end_date)}`
                                : `Expired on: ${formatDate(chatbot.quota.trial_end_date)}`
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle size={20} className="text-red-500" />
                          <div>
                            <h4 className="font-medium">No Active Subscription</h4>
                            <p className="text-sm text-muted-foreground">
                              Chatbot has no active subscription
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Message Limit</p>
                          <p className="font-medium">{formatNumber(chatbot.quota.message_limit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Messages Used</p>
                          <p className="font-medium">{formatNumber(chatbot.quota.messages_used)}</p>
                        </div>
                        {chatbot.quota.temporary_message_boost > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">Temporary Boost</p>
                            <p className="font-medium">+{formatNumber(chatbot.quota.temporary_message_boost)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Last Reset</p>
                          <p className="font-medium">{formatDate(chatbot.quota.last_reset)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-medium mb-3">Payment History</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentData?.transactions?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No payment history available
                          </TableCell>
                        </TableRow>
                      ) : (
                        paymentData?.transactions?.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="font-mono text-xs">{payment.transaction_id}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{payment.payment_method}</TableCell>
                            <TableCell>
                              <Badge
                                variant={payment.status === 'completed' ? 'default' : 'outline'}
                                className={payment.status === 'completed' 
                                  ? 'bg-green-500'
                                  : payment.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }
                              >
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}