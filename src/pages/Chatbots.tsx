import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, Zap, Search, ArrowUpDown, Building2,
  ExternalLink, AlertCircle, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrganizationOverview } from '../api/organizations';
import { formatNumber } from '../utils/format';
import SkeletonLoader from '../components/ui/Skeleton';

type SortField = 'name' | 'organization' | 'tokens' | 'status';
type SortOrder = 'asc' | 'desc';

interface ChatbotWithOrg {
  id: number;
  name: string;
  organization: {
    id: number;
    name: string;
  };
  chatbot_token_count: number;
  canSendMessage?: boolean;
}

const Chatbots: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('tokens');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const { 
    data: organizationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizationOverview'],
    queryFn: getOrganizationOverview
  });
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  // Extract chatbots with organization info
  const getAllChatbots = (): ChatbotWithOrg[] => {
    if (!organizationData) return [];
    
    return organizationData.organizations.flatMap(org => 
      org.chatbots.map(chatbot => ({
        id: chatbot.id,
        name: chatbot.name,
        organization: {
          id: org.id,
          name: org.name
        },
        chatbot_token_count: chatbot.chatbot_token_count,
      }))
    );
  };
  
  // Filter chatbots by search term
  const filteredChatbots = getAllChatbots().filter((chatbot) => 
    chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chatbot.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort chatbots
  const sortedChatbots = [...filteredChatbots].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'organization':
        comparison = a.organization.name.localeCompare(b.organization.name);
        break;
      case 'tokens':
        comparison = a.chatbot_token_count - b.chatbot_token_count;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Column sorting header
  const SortableHeader = ({ title, field }: { title: string, field: SortField }) => (
    <th 
      className="p-4 text-left font-medium text-muted-foreground cursor-pointer select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{title}</span>
        <ArrowUpDown size={14} className={sortField === field ? 'text-primary' : ''} />
      </div>
    </th>
  );

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-destructive">Error loading chatbots. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Chatbots</h1>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chatbots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>
      
      {/* Chatbots Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Chatbots</p>
            {isLoading ? (
              <SkeletonLoader width={60} height={28} />
            ) : (
              <p className="text-2xl font-bold">
                {getAllChatbots().length}
              </p>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tokens Used</p>
            {isLoading ? (
              <SkeletonLoader width={60} height={28} />
            ) : (
              <p className="text-2xl font-bold">
                {formatNumber(
                  getAllChatbots().reduce(
                    (sum, chatbot) => sum + chatbot.chatbot_token_count, 0
                  )
                )}
              </p>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Chatbots Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader count={5} height={40} className="mb-4" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <SortableHeader title="Chatbot Name" field="name" />
                    <SortableHeader title="Organization" field="organization" />
                    <SortableHeader title="Token Usage" field="tokens" />
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChatbots.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        {searchTerm ? 'No chatbots match your search' : 'No chatbots found'}
                      </td>
                    </tr>
                  ) : (
                    sortedChatbots.map((chatbot) => (
                      <tr key={chatbot.id} className="border-b border-border hover:bg-muted/20">
                        <td className="p-4">
                          <div className="font-medium flex items-center">
                            <MessageCircle size={16} className="mr-2 text-primary" />
                            {chatbot.name}
                          </div>
                        </td>
                        <td className="p-4">
                          <Link 
                            to={`/organizations/${chatbot.organization.id}`}
                            className="flex items-center hover:text-primary"
                          >
                            <Building2 size={16} className="mr-2 text-muted-foreground" />
                            {chatbot.organization.name}
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Zap size={16} className="mr-2 text-muted-foreground" />
                            {formatNumber(chatbot.chatbot_token_count)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Link 
                            to={`/chatbots/${chatbot.id}`} 
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            <span>Manage</span>
                            <ExternalLink size={14} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-border text-sm text-muted-foreground">
              Showing {sortedChatbots.length} chatbots
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Chatbots;