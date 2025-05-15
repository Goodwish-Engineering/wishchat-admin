import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Container as ChartContainer, BarChart as ChartTooltip, Printer, ArrowDownToLine, RefreshCw, BarChart3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTokenUsage } from '../api/tokenUsage';
import { getOrganizationOverview } from '../api/organizations';
import { formatNumber } from '../utils/format';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import OrganizationPieChart from '../components/charts/OrganizationPieChart';
import SkeletonLoader from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Fetch token usage data for selected month
  const { 
    data: tokenUsageData,
    isLoading: isTokenUsageLoading,
    refetch: refetchTokenUsage,
  } = useQuery({
    queryKey: ['tokenUsage', selectedMonth],
    queryFn: () => getTokenUsage(selectedMonth)
  });
  
  // Fetch organization data for pie chart
  const { 
    data: organizationData,
    isLoading: isOrganizationLoading,
    refetch: refetchOrganizations,
  } = useQuery({
    queryKey: ['organizationOverview'],
    queryFn: getOrganizationOverview
  });
  
  // Calculate monthly data for the current year
  const monthlyDataKeys = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return `${selectedYear}-${month}`;
  });
  
  // Generate month options for the dropdown
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      
      const label = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      options.push({ value, label });
    }
    
    return options;
  };
  
  // Year options for the last 5 years
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };
  
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };
  
  const refreshData = () => {
    refetchTokenUsage();
    refetchOrganizations();
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:text-white">
        <h1 className="text-xl font-semibold ">Analytics & Reports</h1>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Calendar size={18} className="mr-2 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input py-1 h-auto "
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={refreshData}
            className="btn btn-outline p-2"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={handlePrint}
            className="btn btn-outline flex items-center space-x-2"
            title="Print report"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print</span>
          </button>
          
          <button
            className="btn btn-outline flex items-center space-x-2"
            title="Export data"
            onClick={() => alert('Export functionality not implemented yet')}
          >
            <ArrowDownToLine size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              {isTokenUsageLoading ? (
                <SkeletonLoader width={80} height={36} />
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(tokenUsageData?.total_tokens || 0)}
                </p>
              )}
            </div>
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <BarChart size={24} />
            </div>
          </div>
          
          {!isTokenUsageLoading && tokenUsageData && (
            <div className="mt-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Input Tokens:</span>
                <span>{formatNumber(tokenUsageData.input_tokens)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Tokens:</span>
                <span>{formatNumber(tokenUsageData.output_tokens)}</span>
              </div>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              {isOrganizationLoading ? (
                <SkeletonLoader width={80} height={36} />
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {organizationData?.organization_count || 0}
                </p>
              )}
            </div>
            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
              <ChartContainer size={24} />
            </div>
          </div>
          
          {!isOrganizationLoading && organizationData && (
            <div className="mt-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Active Organizations:</span>
                <span>{organizationData.organizations.filter(org => org.chatbots.length > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Chatbots:</span>
                <span>
                  {organizationData.organizations.reduce((sum, org) => sum + org.chatbots.length, 0)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Tokens per Org</p>
              {isOrganizationLoading || isTokenUsageLoading ? (
                <SkeletonLoader width={80} height={36} />
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {organizationData && organizationData.organization_count > 0
                    ? formatNumber(Math.round(
                        organizationData.organizations.reduce(
                          (sum, org) => sum + org.organization_token_count, 0
                        ) / organizationData.organization_count
                      ))
                    : 0}
                </p>
              )}
            </div>
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <ChartTooltip size={24} />
            </div>
          </div>
          
          {!isOrganizationLoading && organizationData && (
            <div className="mt-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Max Tokens:</span>
                <span>
                  {formatNumber(
                    Math.max(
                      ...organizationData.organizations.map(
                        org => org.organization_token_count
                      ),
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Ratio:</span>
                <span>
                  {organizationData.organization_count > 0
                    ? `${Math.round(
                        (organizationData.organizations.filter(
                          org => org.organization_token_count > 0
                        ).length / organizationData.organization_count) * 100
                      )}%`
                    : '0%'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        {/* Token Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-primary" size={20} />
            Token Usage
          </h2>
          
          {isTokenUsageLoading ? (
            <SkeletonLoader height={300} />
          ) : !tokenUsageData || (tokenUsageData.input_tokens === 0 && tokenUsageData.output_tokens === 0) ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No data available for this period
            </div>
          ) : (
            <TokenUsageChart
              inputTokens={tokenUsageData.input_tokens}
              outputTokens={tokenUsageData.output_tokens}
              title={`Token Usage for ${selectedMonth}`}
            />
          )}
        </motion.div>
        
        {/* Organization Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChartContainer className="mr-2 text-primary" size={20} />
            Organization Token Distribution
          </h2>
          
          {isOrganizationLoading ? (
            <SkeletonLoader height={300} />
          ) : !organizationData || organizationData.organizations.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No organizations data available
            </div>
          ) : (
            <OrganizationPieChart 
              organizations={organizationData.organizations} 
              title="Token Distribution by Organization"
            />
          )}
        </motion.div>
      </div>
      
      {/* Top Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Top Organizations by Token Usage</h2>
        </div>
        
        <div className="p-0">
          {isOrganizationLoading ? (
            <div className="p-6">
              <SkeletonLoader count={5} height={40} className="mb-4" />
            </div>
          ) : !organizationData || organizationData.organizations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No organizations data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Rank</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Organization</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Chatbots</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Total Tokens</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...organizationData.organizations]
                    .sort((a, b) => b.organization_token_count - a.organization_token_count)
                    .slice(0, 10)
                    .map((org, index) => {
                      // Calculate percentage of total tokens
                      const totalTokens = organizationData.organizations.reduce(
                        (sum, org) => sum + org.organization_token_count, 0
                      );
                      const percentage = totalTokens > 0 
                        ? (org.organization_token_count / totalTokens) * 100
                        : 0;
                      
                      return (
                        <tr key={org.id} className="border-b border-border hover:bg-muted/20">
                          <td className="p-4">{index + 1}</td>
                          <td className="p-4 font-medium">{org.name}</td>
                          <td className="p-4">{org.chatbots.length}</td>
                          <td className="p-4">{formatNumber(org.organization_token_count)}</td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <span className="mr-2">{percentage.toFixed(1)}%</span>
                              <div className="h-2 w-full max-w-[100px] bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;