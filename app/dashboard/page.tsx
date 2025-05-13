"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getOrganizationOverview, getTotalTokenUsage } from '@/lib/api';
import { formatNumber, getCurrentMonthYear, getMonthName, getRandomColor } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/loading-spinner';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import {
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  ArrowRight,
  Building2,
  ShieldAlert,
} from 'lucide-react';

// Fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  
  // Fetch organization overview
  const { data: orgOverview, error: orgError, isLoading: orgLoading } = useSWR(
    'organization-overview',
    () => getOrganizationOverview().then(res => res.data),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch token usage
  const { data: tokenUsage, error: tokenError, isLoading: tokenLoading } = useSWR(
    `token-usage-${currentMonth}`,
    () => getTotalTokenUsage(currentMonth).then(res => res.data),
    { refreshInterval: 30000 }
  );

  const isLoading = orgLoading || tokenLoading;
  const hasError = orgError || tokenError;

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
        <ShieldAlert className="text-destructive w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">
          There was an error loading the dashboard data. Please try again later.
        </p>
      </div>
    );
  }

  // Prepare data for organization chart
  const orgChartData = orgOverview?.organizations?.slice(0, 5).map((org) => ({
    name: org.name,
    tokenCount: org.organization_token_count,
    chatbotCount: org.chatbots.length,
  })) || [];

  // Prepare data for token usage pie chart
  const tokenPieData = [
    { name: 'Input Tokens', value: tokenUsage?.input_tokens || 0 },
    { name: 'Output Tokens', value: tokenUsage?.output_tokens || 0 },
  ];

  // Prepare data for chatbot distribution
  const allChatbots = orgOverview?.organizations?.flatMap(org => 
    org.chatbots.map(chatbot => ({
      name: chatbot.name,
      organization: org.name,
      tokenCount: chatbot.chatbot_token_count || 0,
    }))
  ).sort((a, b) => b.tokenCount - a.tokenCount).slice(0, 10) || [];

  const currentMonthName = getMonthName(parseInt(currentMonth.split('-')[1]));
  const currentYear = currentMonth.split('-')[0];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.first_name || 'Admin'}!</h2>
              <p className="text-muted-foreground mt-1">
                Here's what's happening across your platform today.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                <h3 className="text-2xl font-bold mt-1">{orgOverview?.organization_count || 0}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Building2 size={20} />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/organizations" className="text-sm text-primary flex items-center">
                View all <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">
                  {orgOverview?.organizations?.reduce((acc, org) => acc + org.organization_members.length, 0) || 0}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/organizations" className="text-sm text-primary flex items-center">
                View details <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chatbots</p>
                <h3 className="text-2xl font-bold mt-1">
                  {orgOverview?.organizations?.reduce((acc, org) => acc + org.chatbots.length, 0) || 0}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/chatbots" className="text-sm text-primary flex items-center">
                View all <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens Used</p>
                <h3 className="text-2xl font-bold mt-1">{formatNumber(tokenUsage?.total_tokens || 0)}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Zap size={20} />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/analytics" className="text-sm text-primary flex items-center">
                View analytics <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
          <TabsTrigger value="chatbots">Top Chatbots</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization Overview</CardTitle>
                <CardDescription>
                  Token usage by top 5 organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orgChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tokenCount" name="Tokens Used" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="chatbotCount" name="Chatbots" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Distribution ({currentMonthName} {currentYear})</CardTitle>
                <CardDescription>
                  Input vs output token usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
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
                        {tokenPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Token Usage Breakdown</CardTitle>
              <CardDescription>
                Detailed token usage for {currentMonthName} {currentYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                        <h3 className="text-3xl font-bold">{formatNumber(tokenUsage?.total_tokens || 0)}</h3>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Input Tokens</p>
                        <h3 className="text-3xl font-bold">{formatNumber(tokenUsage?.input_tokens || 0)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(((tokenUsage?.input_tokens || 0) / (tokenUsage?.total_tokens || 1)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Output Tokens</p>
                        <h3 className="text-3xl font-bold">{formatNumber(tokenUsage?.output_tokens || 0)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(((tokenUsage?.output_tokens || 0) / (tokenUsage?.total_tokens || 1)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Month-to-Month Comparison</h3>
                    <div className="h-80">
                      <p className="flex items-center justify-center h-full text-muted-foreground">
                        Historical data will be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chatbots">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Chatbots by Token Usage</CardTitle>
              <CardDescription>
                The most active chatbots across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allChatbots}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        formatNumber(value as number), 
                        'Tokens Used'
                      ]}
                      labelFormatter={(value) => `${value} (${allChatbots.find(c => c.name === value)?.organization})`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="tokenCount" 
                      name="Tokens Used" 
                      fill="hsl(var(--chart-3))" 
                    >
                      {allChatbots.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}