"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { getOrganizationChatbots, getOrganizationTokenUsage } from '@/lib/api';
import { formatNumber, formatDate, getCurrentMonthYear } from '@/lib/utils';
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
import LoadingSpinner from '@/components/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  MessageSquare,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export default function OrganizationDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const organizationId = parseInt(params.id);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());

  // Fetch organization chatbots
  const { 
    data: chatbotsData, 
    error: chatbotsError, 
    isLoading: chatbotsLoading 
  } = useSWR(
    `org-chatbots-${organizationId}`,
    () => getOrganizationChatbots(organizationId).then(res => res.data),
    { refreshInterval: 30000 }
  );

  // Fetch organization token usage
  const { 
    data: tokenData, 
    error: tokenError, 
    isLoading: tokenLoading 
  } = useSWR(
    `org-tokens-${organizationId}-${currentMonth}`,
    () => getOrganizationTokenUsage(organizationId, currentMonth).then(res => res.data),
    { refreshInterval: 30000 }
  );

  const isLoading = chatbotsLoading || tokenLoading;
  const hasError = chatbotsError || tokenError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Error Loading Organization Details</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading the organization data. Please try again later.
        </p>
        <Button onClick={() => router.push('/dashboard/organizations')}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  const organization = chatbotsData?.Chatbots?.[0]?.organization;
  const chatbots = chatbotsData?.Chatbots || [];

  // Token usage pie chart data
  const tokenPieData = [
    { name: 'Input Tokens', value: tokenData?.input_tokens || 0 },
    { name: 'Output Tokens', value: tokenData?.output_tokens || 0 },
  ];

  // Calculate subscription status
  const getSubscriptionStatusData = () => {
    const total = chatbots.length;
    const trial = chatbots.filter(c => c.quota.is_trial).length;
    const paid = chatbots.filter(c => c.quota.is_paid).length;
    const expired = chatbots.filter(c => !c.quota.can_send_message).length;
    const lifetime = chatbots.filter(c => c.quota.is_lifetime).length;
    
    return [
      { name: 'Paid', value: paid, color: 'hsl(var(--chart-1))' },
      { name: 'Trial', value: trial, color: 'hsl(var(--chart-2))' },
      { name: 'Expired', value: expired, color: 'hsl(var(--chart-3))' },
      { name: 'Lifetime', value: lifetime, color: 'hsl(var(--chart-4))' },
    ].filter(item => item.value > 0);
  };

  const subscriptionStatusData = getSubscriptionStatusData();

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center gap-2"
          onClick={() => router.push('/dashboard/organizations')}
        >
          <ArrowLeft size={16} />
          Back to Organizations
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{organization?.name || 'Organization'}</h1>
            <p className="text-muted-foreground">ID: {organization?.id}</p>
          </div>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Chatbots</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{chatbots.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Active Users</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">
                {/* Assuming we can determine this from available data */}
                {chatbots.filter(c => c.quota.can_send_message).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Token Usage (Current Month)</h3>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{formatNumber(tokenData?.total_tokens || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <p>{organization?.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{organization?.name}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Members</p>
                    <div className="space-y-2">
                      {/* This would need to come from organization members data */}
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-sm">No member details available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>
                  Status of chatbots for this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {subscriptionStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {subscriptionStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No subscription data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Chatbots Tab */}
        <TabsContent value="chatbots">
          <Card>
            <CardHeader>
              <CardTitle>Chatbots</CardTitle>
              <CardDescription>
                All chatbots belonging to {organization?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Trial/Subscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatbots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No chatbots found
                        </TableCell>
                      </TableRow>
                    ) : (
                      chatbots.map((chatbot) => (
                        <TableRow key={chatbot.id}>
                          <TableCell>{chatbot.id}</TableCell>
                          <TableCell className="font-medium">{chatbot.name}</TableCell>
                          <TableCell>
                            {chatbot.quota.can_send_message ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Used: {formatNumber(chatbot.quota.messages_used)}</span>
                                <span>Limit: {formatNumber(chatbot.quota.message_limit)}</span>
                              </div>
                              <Progress 
                                value={(chatbot.quota.messages_used / chatbot.quota.message_limit) * 100} 
                                className="h-2" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {chatbot.quota.is_trial && (
                                <div className="flex items-center gap-1">
                                  <Clock size={14} className="text-yellow-500" />
                                  <span className="text-xs">
                                    Trial {chatbot.quota.is_trial_valid ? 'Active' : 'Expired'}
                                  </span>
                                </div>
                              )}
                              {chatbot.quota.is_paid && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 size={14} className="text-green-500" />
                                  <span className="text-xs">Paid Subscription</span>
                                </div>
                              )}
                              {!chatbot.quota.is_trial && !chatbot.quota.is_paid && (
                                <div className="flex items-center gap-1">
                                  <XCircle size={14} className="text-red-500" />
                                  <span className="text-xs">No active subscription</span>
                                </div>
                              )}
                              {chatbot.quota.grace_period_days > 0 && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle size={14} className="text-amber-500" />
                                  <span className="text-xs">
                                    Grace period: {chatbot.quota.grace_period_days} days
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/chatbots/${chatbot.id}`} legacyBehavior>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <ExternalLink size={16} />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Token Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Token Usage</CardTitle>
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
                Token usage analysis for {organization?.name}
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
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="hsl(var(--chart-1))" />
                      <Cell fill="hsl(var(--chart-2))" />
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Link href={`/dashboard/analytics?organization=${organizationId}`}>
                <Button>View Detailed Analytics</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}