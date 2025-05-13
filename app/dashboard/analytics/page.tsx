"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { format, subMonths } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTotalTokenUsage, getOrganizationOverview } from '@/lib/api';
import { formatNumber, getCurrentMonthYear, getMonthName } from '@/lib/utils';
import LoadingSpinner from '@/components/loading-spinner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  
  // Fetch global token usage
  const { 
    data: tokenData, 
    error: tokenError, 
    isLoading: tokenLoading 
  } = useSWR(
    `global-tokens-${currentMonth}`,
    () => getTotalTokenUsage(currentMonth).then(res => res.data),
    { refreshInterval: 30000 }
  );
  
  // Fetch organization data
  const { 
    data: orgData, 
    error: orgError, 
    isLoading: orgLoading 
  } = useSWR(
    'organization-overview',
    () => getOrganizationOverview().then(res => res.data),
    { refreshInterval: 30000 }
  );

  const isLoading = tokenLoading || orgLoading;
  const hasError = tokenError || orgError;

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
        <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
        <p className="text-muted-foreground">
          There was an error loading the analytics data. Please try again later.
        </p>
      </div>
    );
  }

  // Prepare data for token distribution pie chart
  const tokenPieData = [
    { name: 'Input Tokens', value: tokenData?.input_tokens || 0 },
    { name: 'Output Tokens', value: tokenData?.output_tokens || 0 },
  ];

  // Prepare data for organizations bar chart
  const orgBarData = orgData?.organizations
    ?.filter(org => org.organization_token_count > 0)
    ?.map(org => ({
      name: org.name,
      tokens: org.organization_token_count,
    }))
    ?.sort((a, b) => b.tokens - a.tokens)
    ?.slice(0, 10) || [];

  // Prepare data for token usage trend
  const currentDate = new Date();
  const trendData = Array.from({ length: 5 }, (_, i) => {
    const month = subMonths(currentDate, i);
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    // For demonstration purposes, we'll generate some random data
    // In a real app, you would fetch this data from the API
    const inputTokens = i === 0 ? tokenData?.input_tokens : Math.floor(Math.random() * 60000);
    const outputTokens = i === 0 ? tokenData?.output_tokens : Math.floor(Math.random() * 5000);
    
    return {
      month: format(month, 'MMM'),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }).reverse();

  // Prepare data for top chatbots
  const topChatbots = orgData?.organizations
    ?.flatMap(org => 
      org.chatbots
        .filter(chatbot => chatbot.chatbot_token_count > 0)
        .map(chatbot => ({
          name: chatbot.name,
          organization: org.name,
          tokens: chatbot.chatbot_token_count,
        }))
    )
    ?.sort((a, b) => b.tokens - a.tokens)
    ?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Token usage and performance metrics
          </p>
        </div>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
              <h3 className="text-3xl font-bold">{formatNumber(tokenData?.total_tokens || 0)}</h3>
              <p className="text-xs text-muted-foreground">
                {getMonthName(parseInt(currentMonth.split('-')[1]))} {currentMonth.split('-')[0]}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Input Tokens</p>
              <h3 className="text-3xl font-bold">{formatNumber(tokenData?.input_tokens || 0)}</h3>
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
                {(((tokenData?.output_tokens || 0) / (tokenData?.total_tokens || 1)) * 100).toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        {/* Token Usage Tab */}
        <TabsContent value="usage">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Distribution</CardTitle>
                <CardDescription>
                  Input vs output token usage
                </CardDescription>
              </CardHeader>
              <CardContent>
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
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Token Trend</CardTitle>
                <CardDescription>
                  Token usage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Top Organizations by Token Usage</CardTitle>
              <CardDescription>
                Organizations with highest token consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={orgBarData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    <Bar 
                      dataKey="tokens" 
                      name="Token Usage" 
                      fill="hsl(var(--chart-3))" 
                    >
                      {orgBarData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Chatbots Tab */}
        <TabsContent value="chatbots">
          <Card>
            <CardHeader>
              <CardTitle>Top Chatbots by Token Usage</CardTitle>
              <CardDescription>
                Most active chatbots across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topChatbots}
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
                      labelFormatter={(value) => `${value} (${topChatbots.find(c => c.name === value)?.organization})`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="tokens" 
                      name="Tokens Used" 
                      fill="hsl(var(--chart-4))" 
                    >
                      {topChatbots.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Usage Growth</CardTitle>
                <CardDescription>
                  Month-over-month token usage growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalTokens" 
                        name="Total Tokens" 
                        stroke="hsl(var(--chart-5))" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Input/Output Token Ratio</CardTitle>
                <CardDescription>
                  Comparison of input and output tokens over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trendData}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}