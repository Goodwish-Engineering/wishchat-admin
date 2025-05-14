import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Users, MessageCircle, Zap, 
  User, Mail, ChevronLeft, ExternalLink, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrganizationOverview, getOrganizationChatbots, getOrganizationTokenUsage } from '../api/organizations';
import { formatNumber, formatDate } from '../utils/format';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import SkeletonLoader from '../components/ui/Skeleton';

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationId = parseInt(id || '0');
  
  // Fetch organization data
  const { 
    data: overviewData,
    isLoading: isOverviewLoading,
  } = useQuery({
    queryKey: ['organizationOverview'],
    queryFn: getOrganizationOverview
  });
  
  // Fetch chatbots for this organization
  const { 
    data: chatbotsData,
    isLoading: isChatbotsLoading,
  } = useQuery({
    queryKey: ['organizationChatbots', organizationId],
    queryFn: () => getOrganizationChatbots(organizationId),
    enabled: !!organizationId,
  });
  
  // Fetch token usage for this organization
  const { 
    data: tokenUsageData,
    isLoading: isTokenUsageLoading,
  } = useQuery({
    queryKey: ['organizationTokenUsage', organizationId],
    queryFn: () => getOrganizationTokenUsage(organizationId),
    enabled: !!organizationId,
  });
  
  // Find the organization from the overview data
  const organization = overviewData?.organizations.find(
    (org) => org.id === organizationId
  );
  
  if (isOverviewLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/organizations')}
            className="btn btn-outline flex items-center space-x-1 px-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <SkeletonLoader width={200} height={32} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader height={100} />
          <SkeletonLoader height={100} />
          <SkeletonLoader height={100} />
        </div>
        <SkeletonLoader height={300} />
        <SkeletonLoader height={400} />
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Organization not found</h2>
        <p className="text-muted-foreground mb-6">
          The organization you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/organizations" className="btn btn-primary">
          Back to Organizations
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/organizations')}
            className="btn btn-outline flex items-center space-x-1 px-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-semibold flex items-center">
            <Building2 className="mr-2 text-primary" />
            {organization.name}
          </h1>
        </div>
      </div>
      
      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Members</p>
            <p className="text-2xl font-bold">{organization.organization_members.length}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chatbots</p>
            <p className="text-2xl font-bold">{organization.chatbots.length}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <p className="text-2xl font-bold">{formatNumber(organization.organization_token_count)}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Token Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Token Usage</h2>
        
        {isTokenUsageLoading ? (
          <SkeletonLoader height={300} />
        ) : !tokenUsageData ? (
          <div className="text-center p-4 text-muted-foreground">
            No token usage data available
          </div>
        ) : (
          <TokenUsageChart
            inputTokens={tokenUsageData.input_tokens}
            outputTokens={tokenUsageData.output_tokens}
            title=""
          />
        )}
      </motion.div>
      
      {/* Organization Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card lg:col-span-1"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Members</h2>
          </div>
          
          <div className="p-4">
            {organization.organization_members.length === 0 ? (
              <p className="text-center text-muted-foreground p-4">No members found</p>
            ) : (
              <ul className="space-y-3">
                {organization.organization_members.map((member, index) => (
                  <li key={index} className="flex items-center p-2 hover:bg-muted/20 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3">
                      <User size={16} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center">
                        <Mail size={14} className="text-muted-foreground mr-1" />
                        <span className="text-sm truncate">{member.email}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
        
        {/* Chatbots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card lg:col-span-2"
        >
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chatbots</h2>
            
            <Link to="/chatbots" className="text-primary text-sm hover:underline">
              View All Chatbots
            </Link>
          </div>
          
          <div className="p-0">
            {isChatbotsLoading ? (
              <div className="p-6">
                <SkeletonLoader count={3} height={50} className="mb-3" />
              </div>
            ) : !chatbotsData?.Chatbots.length ? (
              <p className="text-center text-muted-foreground p-6">No chatbots found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Token Usage</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Created</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatbotsData.Chatbots.map((chatbot) => (
                      <tr key={chatbot.id} className="border-b border-border hover:bg-muted/20">
                        <td className="p-4">
                          <div className="font-medium">{chatbot.name}</div>
                        </td>
                        <td className="p-4">
                          {organization.chatbots.find(c => c.id === chatbot.id)?.chatbot_token_count || 0}
                        </td>
                        <td className="p-4">
                          {chatbot.created_at ? formatDate(chatbot.created_at) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <Link 
                            to={`/chatbots/${chatbot.id}`} 
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            <span>View</span>
                            <ExternalLink size={14} className="ml-1" />
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
    </div>
  );
};

export default OrganizationDetails;