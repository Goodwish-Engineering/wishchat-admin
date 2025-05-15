import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Zap, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrganizationOverview } from '../api/organizations';
import { formatNumber } from '../utils/format';
import SkeletonLoader from '../components/ui/Skeleton';

type SortField = 'name' | 'members' | 'chatbots' | 'tokens';
type SortOrder = 'asc' | 'desc';

const Organizations: React.FC = () => {
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
  
  // Filter organizations by search term
  const filteredOrganizations = organizationData?.organizations.filter((org) => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Sort organizations
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'members':
        comparison = a.organization_members.length - b.organization_members.length;
        break;
      case 'chatbots':
        comparison = a.chatbots.length - b.chatbots.length;
        break;
      case 'tokens':
        comparison = a.organization_token_count - b.organization_token_count;
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
        <p className="text-destructive">Error loading organizations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:text-white">
        <h1 className="text-xl font-semibold ">Organizations</h1>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>
      
      {/* Organizations Stats */}
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
            <p className="text-sm text-muted-foreground">Total Organizations</p>
            {isLoading ? (
              <SkeletonLoader width={60} height={28} />
            ) : (
              <p className="text-2xl font-bold">{organizationData?.organization_count || 0}</p>
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
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Chatbots</p>
            {isLoading ? (
              <SkeletonLoader width={60} height={28} />
            ) : (
              <p className="text-2xl font-bold">
                {organizationData?.organizations.reduce((sum, org) => sum + org.chatbots.length, 0) || 0}
              </p>
            )}
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
            {isLoading ? (
              <SkeletonLoader width={60} height={28} />
            ) : (
              <p className="text-2xl font-bold">
                {formatNumber(
                  organizationData?.organizations.reduce(
                    (sum, org) => sum + org.organization_token_count, 0
                  ) || 0
                )}
              </p>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Organizations Table */}
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
                    <SortableHeader title="Organization Name" field="name" />
                    <SortableHeader title="Members" field="members" />
                    <SortableHeader title="Chatbots" field="chatbots" />
                    <SortableHeader title="Total Tokens" field="tokens" />
                    <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        {searchTerm ? 'No organizations match your search' : 'No organizations found'}
                      </td>
                    </tr>
                  ) : (
                    sortedOrganizations.map((org) => (
                      <tr key={org.id} className="border-b border-border hover:bg-muted/20">
                        <td className="p-4">
                          <div className="font-medium">{org.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Users size={16} className="mr-2 text-muted-foreground" />
                            {org.organization_members.length}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <MessageCircle size={16} className="mr-2 text-muted-foreground" />
                            {org.chatbots.length}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Zap size={16} className="mr-2 text-muted-foreground" />
                            {formatNumber(org.organization_token_count)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Link 
                            to={`/organizations/${org.id}`} 
                            className="text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-border text-sm text-muted-foreground">
              Showing {sortedOrganizations.length} organizations
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Organizations;