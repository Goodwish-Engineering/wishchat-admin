import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageCircle, Zap, ChevronLeft, Building2, Calendar, 
  Clock, AlertCircle, CheckCircle2, Infinity, Plus, Ban, 
  Timer, RefreshCw, Pencil, Clock4
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrganizationOverview, getOrganizationChatbots } from '../api/organizations';
import { 
  getChatbotTokenUsage, addTemporaryBoost, updateGracePeriod, 
  updateSendingStatus, updateMessageLimit, assignLifetimePlan, 
  revokeLifetimePlan, getChatbotPayments
} from '../api/chatbots';
import { formatNumber, formatDate } from '../utils/format';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import SkeletonLoader from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const ChatbotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chatbotId = parseInt(id || '0');
  
  // State for forms and modals
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [boostAmount, setBoostAmount] = useState<number>(500);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(5);
  const [messageLimit, setMessageLimit] = useState<number>(5000);
  
  // Dialog states
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [showGracePeriodDialog, setShowGracePeriodDialog] = useState(false);
  const [showSendingToggleDialog, setShowSendingToggleDialog] = useState(false);
  const [showMessageLimitDialog, setShowMessageLimitDialog] = useState(false);
  const [showLifetimeDialog, setShowLifetimeDialog] = useState(false);
  const [showRevokeLifetimeDialog, setShowRevokeLifetimeDialog] = useState(false);
  
  // Find organization and chatbot data
  const { 
    data: overviewData,
    isLoading: isOverviewLoading,
  } = useQuery({
    queryKey: ['organizationOverview'],
    queryFn: getOrganizationOverview
  });
  
  // Determine which organization this chatbot belongs to
  const chatbotOrg = overviewData?.organizations.find(
    (org) => org.chatbots.some(c => c.id === chatbotId)
  );
  
  // Fetch full chatbot details
  const { 
    data: chatbotsData,
    isLoading: isChatbotsLoading,
  } = useQuery({
    queryKey: ['organizationChatbots', chatbotOrg?.id],
    queryFn: () => getOrganizationChatbots(chatbotOrg?.id || 0),
    enabled: !!chatbotOrg?.id,
  });
  
  // Get the specific chatbot details
  const chatbot = chatbotsData?.Chatbots.find(c => c.id === chatbotId);
  
  // Fetch token usage for this chatbot
  const { 
    data: tokenUsageData,
    isLoading: isTokenUsageLoading,
  } = useQuery({
    queryKey: ['chatbotTokenUsage', chatbotId, selectedMonth],
    queryFn: () => getChatbotTokenUsage(chatbotId, selectedMonth),
    enabled: !!chatbotId,
  });
  
  // Fetch payment history
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
  } = useQuery({
    queryKey: ['chatbotPayments', chatbotId],
    queryFn: () => getChatbotPayments(chatbotId),
    enabled: !!chatbotId,
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
  
  // Mutations for chatbot actions
  const boostMutation = useMutation({
    mutationFn: () => addTemporaryBoost(chatbotId, boostAmount),
    onSuccess: () => {
      toast.success(`Added ${boostAmount} messages to ${chatbot?.name}`);
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowBoostDialog(false);
    },
    onError: () => toast.error("Failed to add message boost")
  });
  
  const gracePeriodMutation = useMutation({
    mutationFn: () => updateGracePeriod(chatbotId, gracePeriodDays),
    onSuccess: () => {
      toast.success(`Updated grace period to ${gracePeriodDays} days`);
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowGracePeriodDialog(false);
    },
    onError: () => toast.error("Failed to update grace period")
  });
  
  const sendingStatusMutation = useMutation({
    mutationFn: () => updateSendingStatus(chatbotId, !chatbot?.quota?.is_sending_enabled),
    onSuccess: () => {
      toast.success(
        chatbot?.quota?.is_sending_enabled 
          ? "Message sending disabled" 
          : "Message sending enabled"
      );
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowSendingToggleDialog(false);
    },
    onError: () => toast.error("Failed to update sending status")
  });
  
  const messageLimitMutation = useMutation({
    mutationFn: () => updateMessageLimit(chatbotId, messageLimit),
    onSuccess: () => {
      toast.success(`Updated message limit to ${messageLimit}`);
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowMessageLimitDialog(false);
    },
    onError: () => toast.error("Failed to update message limit")
  });
  
  const lifetimePlanMutation = useMutation({
    mutationFn: assignLifetimePlan,
    onSuccess: () => {
      toast.success("Lifetime plan assigned successfully");
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowLifetimeDialog(false);
    },
    onError: () => toast.error("Failed to assign lifetime plan")
  });
  
  const revokeLifetimeMutation = useMutation({
    mutationFn: revokeLifetimePlan,
    onSuccess: () => {
      toast.success("Lifetime plan revoked successfully");
      queryClient.invalidateQueries({ queryKey: ['organizationChatbots'] });
      setShowRevokeLifetimeDialog(false);
    },
    onError: () => toast.error("Failed to revoke lifetime plan")
  });
  
  // Loading state
  if (isOverviewLoading || isChatbotsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-1 px-2">
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
  
  // Not found state
  if (!chatbot || !chatbotOrg) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Chatbot not found</h2>
        <p className="text-muted-foreground mb-6">
          The chatbot you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/chatbots" className="btn btn-primary">
          Back to Chatbots
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
            onClick={() => navigate('/chatbots')}
            className="btn btn-outline flex items-center space-x-1 px-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-semibold flex items-center">
            <MessageCircle className="mr-2 text-primary" />
            {chatbot.name}
          </h1>
        </div>
        
        <Link
          to={`/organizations/${chatbotOrg.id}`}
          className="btn btn-outline flex items-center space-x-2"
        >
          <Building2 size={16} />
          <span>{chatbotOrg.name}</span>
        </Link>
      </div>
      
      {/* Chatbot Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <p className="text-sm text-muted-foreground">Messages Used / Limit</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold">
              {formatNumber(chatbot.quota?.messages_used || 0)} / {formatNumber(chatbot.quota?.message_limit || 0)}
            </p>
            {chatbot.quota?.temporary_message_boost > 0 && (
              <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                +{formatNumber(chatbot.quota.temporary_message_boost)} boost
              </span>
            )}
          </div>
          
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ 
                width: `${Math.min(100, (chatbot.quota?.messages_used || 0) / (chatbot.quota?.message_limit || 1) * 100)}%` 
              }}
            />
          </div>
          
          <div className="mt-3 flex items-center text-sm">
            {chatbot.quota?.is_sending_enabled ? (
              <CheckCircle2 size={16} className="text-success mr-1" />
            ) : (
              <AlertCircle size={16} className="text-destructive mr-1" />
            )}
            <span>
              {chatbot.quota?.is_sending_enabled ? 'Sending enabled' : 'Sending disabled'}
            </span>
          </div>
          
          {chatbot.quota?.is_lifetime && (
            <div className="mt-2 flex items-center text-sm">
              <Infinity size={16} className="text-primary mr-1" />
              <span>Lifetime plan activated</span>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <p className="text-sm text-muted-foreground">Subscription Status</p>
          <div className="flex items-center mt-1">
            <p className="text-xl font-medium">
              {chatbot.quota?.is_trial 
                ? 'Trial Period' 
                : chatbot.quota?.is_paid 
                  ? 'Paid Subscription' 
                  : 'No Active Subscription'}
            </p>
          </div>
          
          <div className="mt-3 space-y-2">
            {chatbot.quota?.is_trial && (
              <div className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-muted-foreground" />
                <span>
                  Trial ends: {formatDate(chatbot.quota.trial_end_date)}
                </span>
              </div>
            )}
            
            {chatbot.quota?.subscription_end_date && (
              <div className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-muted-foreground" />
                <span>
                  Subscription ends: {formatDate(chatbot.quota.subscription_end_date)}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <Clock4 size={16} className="mr-2 text-muted-foreground" />
              <span>
                Grace period: {chatbot.quota?.grace_period_days} days
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <p className="text-sm text-muted-foreground">Token Usage</p>
          <p className="text-2xl font-bold mt-1">
            {formatNumber(
              chatbotOrg.chatbots.find(c => c.id === chatbotId)?.chatbot_token_count || 0
            )}
          </p>
          
          {tokenUsageData && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Input tokens:</span>
                <span className="font-medium">{formatNumber(tokenUsageData.input_tokens)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Output tokens:</span>
                <span className="font-medium">{formatNumber(tokenUsageData.output_tokens)}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setShowBoostDialog(true)}
          className="btn btn-outline flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Messages</span>
        </button>
        
        <button 
          onClick={() => setShowGracePeriodDialog(true)}
          className="btn btn-outline flex items-center justify-center space-x-2"
        >
          <Clock size={16} />
          <span>Update Grace Period</span>
        </button>
        
        <button 
          onClick={() => setShowSendingToggleDialog(true)}
          className="btn btn-outline flex items-center justify-center space-x-2"
        >
          {chatbot.quota?.is_sending_enabled ? (
            <>
              <Ban size={16} />
              <span>Disable Sending</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Enable Sending</span>
            </>
          )}
        </button>
        
        <button 
          onClick={() => setShowMessageLimitDialog(true)}
          className="btn btn-outline flex items-center justify-center space-x-2"
        >
          <Pencil size={16} />
          <span>Update Message Limit</span>
        </button>
        
        {chatbot.quota?.is_lifetime ? (
          <button 
            onClick={() => setShowRevokeLifetimeDialog(true)}
            className="btn btn-danger flex items-center justify-center space-x-2"
          >
            <Ban size={16} />
            <span>Revoke Lifetime Plan</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowLifetimeDialog(true)}
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <Infinity size={16} />
            <span>Assign Lifetime Plan</span>
          </button>
        )}
      </div>
      
      {/* Token Usage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Token Usage</h2>
            
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
          
          {isTokenUsageLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
          ) : !tokenUsageData || (tokenUsageData.input_tokens === 0 && tokenUsageData.output_tokens === 0) ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No data available for this period
            </div>
          ) : (
            <TokenUsageChart
              inputTokens={tokenUsageData.input_tokens}
              outputTokens={tokenUsageData.output_tokens}
              title=""
            />
          )}
        </motion.div>
        
        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Payment History</h2>
          </div>
          
          <div className="p-0">
            {isPaymentsLoading ? (
              <div className="p-6">
                <SkeletonLoader count={3} height={40} className="mb-3" />
              </div>
            ) : !paymentsData?.transactions.length ? (
              <div className="p-8 text-center text-muted-foreground">
                No payment history available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Plan</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/20">
                        <td className="p-4">{formatDate(transaction.date)}</td>
                        <td className="p-4">{transaction.plan_name}</td>
                        <td className="p-4">Rs.{transaction.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Chat Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Chatbot Details</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">API Key</div>
                <div className="col-span-2 font-mono text-sm bg-muted/50 p-2 rounded">
                  {chatbot.api_key || 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Azure Index</div>
                <div className="col-span-2 text-sm">
                  {chatbot.azure_index_name || 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Created At</div>
                <div className="col-span-2 text-sm">
                  {chatbot.created_at ? formatDate(chatbot.created_at) : 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="col-span-2 text-sm">
                  {chatbot.updated_at ? formatDate(chatbot.updated_at) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Subscription</div>
                <div className="col-span-2 text-sm">
                  {chatbot.quota?.subscription_plan 
                    ? `Plan #${chatbot.quota.subscription_plan}` 
                    : chatbot.quota?.is_lifetime 
                      ? 'Lifetime Plan' 
                      : chatbot.quota?.is_trial 
                        ? 'Trial Plan' 
                        : 'No Active Plan'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Trial Status</div>
                <div className="col-span-2 text-sm">
                  {chatbot.quota?.is_trial ? (
                    chatbot.quota.is_trial_valid 
                      ? <span className="text-success flex items-center"><CheckCircle2 size={16} className="mr-1" /> Active</span>
                      : <span className="text-destructive flex items-center"><AlertCircle size={16} className="mr-1" /> Expired</span>
                  ) : (
                    'Not on trial'
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Trial Period</div>
                <div className="col-span-2 text-sm">
                  {chatbot.quota?.trial_start_date ? (
                    <span>
                      {formatDate(chatbot.quota.trial_start_date)} to {formatDate(chatbot.quota.trial_end_date)}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">Last Reset</div>
                <div className="col-span-2 text-sm">
                  {chatbot.quota?.last_reset ? formatDate(chatbot.quota.last_reset) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Dialogs */}
      <ConfirmDialog 
        isOpen={showBoostDialog}
        title="Add Temporary Messages"
        message={
          <div>
            <p className="mb-4">How many additional messages would you like to add?</p>
            <input
              type="number"
              value={boostAmount}
              onChange={(e) => setBoostAmount(parseInt(e.target.value))}
              min="1"
              max="100000"
              className="input w-full mb-2"
            />
          </div>
        }
        confirmText="Add Messages"
        confirmButtonClass="btn-primary"
        onConfirm={() => boostMutation.mutate()}
        onCancel={() => setShowBoostDialog(false)}
      />
      
      <ConfirmDialog 
        isOpen={showGracePeriodDialog}
        title="Update Grace Period"
        message={
          <div>
            <p className="mb-4">Set the number of grace period days:</p>
            <input
              type="number"
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(parseInt(e.target.value))}
              min="0"
              max="30"
              className="input w-full mb-2"
            />
          </div>
        }
        confirmText="Update"
        confirmButtonClass="btn-primary"
        onConfirm={() => gracePeriodMutation.mutate()}
        onCancel={() => setShowGracePeriodDialog(false)}
      />
      
      <ConfirmDialog 
        isOpen={showSendingToggleDialog}
        title={chatbot.quota?.is_sending_enabled ? "Disable Message Sending" : "Enable Message Sending"}
        message={
          chatbot.quota?.is_sending_enabled
            ? "Are you sure you want to disable message sending for this chatbot? Users will not be able to send messages."
            : "Are you sure you want to enable message sending for this chatbot?"
        }
        confirmText={chatbot.quota?.is_sending_enabled ? "Disable" : "Enable"}
        confirmButtonClass={chatbot.quota?.is_sending_enabled ? "btn-danger" : "btn-success"}
        onConfirm={() => sendingStatusMutation.mutate()}
        onCancel={() => setShowSendingToggleDialog(false)}
      />
      
      <ConfirmDialog 
        isOpen={showMessageLimitDialog}
        title="Update Message Limit"
        message={
          <div>
            <p className="mb-4">Set new message limit:</p>
            <input
              type="number"
              value={messageLimit}
              onChange={(e) => setMessageLimit(parseInt(e.target.value))}
              min="100"
              className="input w-full mb-2"
            />
          </div>
        }
        confirmText="Update"
        confirmButtonClass="btn-primary"
        onConfirm={() => messageLimitMutation.mutate()}
        onCancel={() => setShowMessageLimitDialog(false)}
      />
      
      <ConfirmDialog 
        isOpen={showLifetimeDialog}
        title="Assign Lifetime Plan"
        message="Are you sure you want to assign a lifetime free plan to this chatbot? This will give unlimited access without the need for subscription renewals."
        confirmText="Assign Lifetime Plan"
        confirmButtonClass="btn-primary"
        onConfirm={() => lifetimePlanMutation.mutate(chatbotId)}
        onCancel={() => setShowLifetimeDialog(false)}
      />
      
      <ConfirmDialog 
        isOpen={showRevokeLifetimeDialog}
        title="Revoke Lifetime Plan"
        message="Are you sure you want to revoke the lifetime plan from this chatbot? The chatbot will revert to trial or require a subscription plan."
        confirmText="Revoke Lifetime Plan"
        confirmButtonClass="btn-danger"
        onConfirm={() => revokeLifetimeMutation.mutate(chatbotId)}
        onCancel={() => setShowRevokeLifetimeDialog(false)}
      />
    </div>
  );
};

export default ChatbotDetails;