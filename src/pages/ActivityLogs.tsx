import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Activity, Search, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActivityLogs } from '../api/activity';
import SkeletonLoader from '../components/ui/Skeleton';
import { formatDate } from '../utils/format';

const ActivityLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { 
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: getActivityLogs,
    refetchInterval: autoRefresh ? 30000 : false, // Auto refresh every 30 seconds if enabled
  });
  
  // Group logs by date
  const groupedLogs = logsData?.logs.reduce((groups, log) => {
    const date = format(parseISO(log.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, typeof logsData.logs>);
  
  // Filter logs by search term
  const filteredGroupedLogs = Object.entries(groupedLogs || {}).reduce(
    (filtered, [date, logs]) => {
      const filteredLogs = logs.filter((log) =>
        log.activity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredLogs.length > 0) {
        filtered[date] = filteredLogs;
      }
      
      return filtered;
    },
    {} as Record<string, typeof logsData.logs>
  );
  
  // Sort dates in descending order
  const sortedDates = Object.keys(filteredGroupedLogs || {}).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'} flex items-center space-x-2`}
            title={autoRefresh ? 'Disable auto refresh' : 'Enable auto refresh'}
          >
            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Auto Refresh</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="btn btn-outline"
            title="Refresh manually"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Activity Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Activity className="mr-2 text-primary" size={20} />
              Activity History
            </h2>
            
            {logsData && (
              <span className="text-sm text-muted-foreground">
                {logsData.logs.length} activities recorded
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <SkeletonLoader count={10} height={24} className="mb-4" />
          ) : error ? (
            <div className="text-center py-4 text-destructive">
              Failed to load activity logs. Please try again.
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'No activity logs match your search' 
                : 'No activity logs available'}
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-md font-medium mb-4 pb-2 border-b border-border">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  
                  <div className="relative pl-6 border-l-2 border-muted space-y-6">
                    {filteredGroupedLogs[date].map((log) => {
                      // Colorize based on activity type
                      let dotColor = 'bg-blue-500';
                      let iconComponent = null;
                      
                      // Match activity types
                      if (log.activity.includes('created')) {
                        dotColor = 'bg-green-500';
                      } else if (log.activity.includes('deleted')) {
                        dotColor = 'bg-red-500';
                      } else if (log.activity.includes('updated') || log.activity.includes('disabled') || log.activity.includes('enabled')) {
                        dotColor = 'bg-amber-500';
                      } else if (log.activity.includes('assigned') || log.activity.includes('revoked')) {
                        dotColor = 'bg-purple-500';
                      }
                      
                      return (
                        <div key={log.id} className="relative">
                          {/* Colored dot */}
                          <div className={`absolute w-4 h-4 ${dotColor} rounded-full -left-8 top-1 transform -translate-x-1/2`} />
                          
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <span className="text-sm text-muted-foreground flex items-center shrink-0">
                              <Clock size={14} className="mr-1" />
                              {format(parseISO(log.timestamp), 'HH:mm:ss')}
                            </span>
                            
                            <p className="text-base">{log.activity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityLogs;