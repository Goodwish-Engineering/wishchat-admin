import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle, Zap, BarChart3, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrganizationOverview } from '../api/organizations';
import { getTokenUsage } from '../api/tokenUsage';
import { formatNumber } from '../utils/format';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import OrganizationPieChart from '../components/charts/OrganizationPieChart';
import StatsCard from '../components/dashboard/StatsCard';
import SkeletonLoader from '../components/ui/Skeleton';

const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  
  // Fetch organization overview
  const { 
    data: overviewData,
    isLoading: isOverviewLoading
  } = useQuery({
    queryKey: ['organizationOverview'],
    queryFn: getOrganizationOverview
  });
  
  // Fetch token usage for selected month
  const {
    data: tokenUsageData,
    isLoading: isTokenUsageLoading
  } = useQuery({
    queryKey: ['tokenUsage', selectedMonth],
    queryFn: () => getTokenUsage(selectedMonth)
  });
  
  // Generate month options for the last 12 months
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
  
  const monthOptions = getMonthOptions();
  
  // Calculate stats
  const totalOrganizations = overviewData?.organization_count || 0;
  const totalChatbots = overviewData?.organizations.reduce(
    (sum, org) => sum + org.chatbots.length, 0
  ) || 0;
  const totalTokens = tokenUsageData?.total_tokens || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        
        <div className="flex items-center">
          <Calendar size={18} className="mr-2 text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input py-1 h-auto"
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Organizations"
          value={isOverviewLoading ? '...' : formatNumber(totalOrganizations)}
          icon={<Building2 size={24} />}
          className="border-l-4 border-l-blue-500"
          isLoading={isOverviewLoading}
        />
        <StatsCard
          title="Total Chatbots"
          value={isOverviewLoading ? '...' : formatNumber(totalChatbots)}
          icon={<MessageCircle size={24} />}
          className="border-l-4 border-l-green-500"
          isLoading={isOverviewLoading}
        />
        <StatsCard
          title="Total Tokens Used"
          value={isTokenUsageLoading ? '...' : formatNumber(totalTokens)}
          icon={<Zap size={24} />}
          className="border-l-4 border-l-amber-500"
          isLoading={isTokenUsageLoading}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Token Usage</h2>
          
          {isTokenUsageLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : !tokenUsageData ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No data available
            </div>
          ) : (
            <TokenUsageChart
              inputTokens={tokenUsageData.input_tokens}
              outputTokens={tokenUsageData.output_tokens}
              title=""
            />
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            Data for {selectedMonth}
          </div>
        </motion.div>
        
        {/* Organization Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Organization Token Distribution</h2>
          
          {isOverviewLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : !overviewData?.organizations.length ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No organizations available
            </div>
          ) : (
            <OrganizationPieChart organizations={overviewData.organizations} title="" />
          )}
        </motion.div>
      </div>
      
      {/* Organizations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Organizations</h2>
            <Link to="/organizations" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-0">
          {isOverviewLoading ? (
            <div className="p-6">
              <SkeletonLoader count={5} height={40} className="mb-4" />
            </div>
          ) : !overviewData?.organizations.length ? (
            <div className="p-6 text-center text-muted-foreground">
              No organizations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Members</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Chatbots</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Total Tokens</th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewData.organizations.slice(0, 5).map((org) => (
                    <tr key={org.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div className="font-medium">{org.name}</div>
                      </td>
                      <td className="p-4">{org.organization_members.length}</td>
                      <td className="p-4">{org.chatbots.length}</td>
                      <td className="p-4">{formatNumber(org.organization_token_count)}</td>
                      <td className="p-4">
                        <Link 
                          to={`/organizations/${org.id}`} 
                          className="text-primary hover:text-primary/80"
                        >
                          View Details
                        </Link>
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

export default Dashboard;