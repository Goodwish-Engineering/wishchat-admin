import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'https://wishchat.goodwish.com.np/auth';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Organizations
export const getOrganizations = () => api.get('/organizations/list/');
export const getOrganizationOverview = () => api.get('/organization-overview');
export const getOrganizationChatbots = (orgId: number) => api.get(`/${orgId}/chatbots/list/`);

// Chatbots
export const getChatbotTokenUsage = (chatbotId: number, month: string) => 
  api.get(`/chatbots/${chatbotId}/token-usage/?month=${month}`);
export const updateChatbotMessageLimit = (chatbotId: number, messageLimit: number) => 
  api.post(`/chatbots/${chatbotId}/update-message-limit/`, { message_limit: messageLimit });
export const updateChatbotGracePeriod = (chatbotId: number, gracePeriodDays: number) => 
  api.post(`/chatbots/${chatbotId}/update-grace-period/`, { grace_period_days: gracePeriodDays });
export const updateChatbotSendingStatus = (chatbotId: number, isSendingEnabled: boolean) => 
  api.post(`/chatbots/${chatbotId}/update-sending-status/`, { is_sending_enabled: isSendingEnabled });
export const addTemporaryBoost = (chatbotId: number, additionalMessages: number) => 
  api.post(`/chatbots/${chatbotId}/temporary-boost/`, { additional_messages: additionalMessages });
export const setLifetimePlan = (chatbotId: number) => 
  api.post(`/chatbots/${chatbotId}/lifetime-plan/`);
export const revokeLifetimePlan = (chatbotId: number) => 
  api.post(`/chatbots/${chatbotId}/revoke-lifetime/`);

// Tokens
export const getTotalTokenUsage = (month: string) => 
  api.get(`/token-usage/?month=${month}`);
export const getOrganizationTokenUsage = (orgId: number, month: string) => 
  api.get(`/${orgId}/token-usage/?month=${month}`);

// Subscription Plans
export const getSubscriptionPlans = () => api.get('/subscription-plans/');
export const createSubscriptionPlan = (planData: {
  name: string;
  price: number;
  message_limit: number;
  trial_days: number;
  is_active: boolean;
  is_lifetime: boolean;
  auto_reset_quota: boolean;
}) => api.post('/subscription-plans/create/', planData);

// Staff Management
export const createStaff = (staffData: {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}) => api.post('/staff/create/', staffData);

export const updateProfile = (profileData: {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}) => api.patch('/staff/profile/update/', profileData);

// Payments
export const getChatbotPayments = (chatbotId: number) => 
  api.get(`https://wishchat.goodwish.com.np/api/chatbot-payments/?chatbot_id=${chatbotId}`);

export default api;