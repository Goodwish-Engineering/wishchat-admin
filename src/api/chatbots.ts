import api from './axios';
import { TokenUsage, ChatbotPaymentsResponse } from '../types';

export const getChatbotTokenUsage = async (
  chatbotId: number, 
  month?: string
): Promise<TokenUsage> => {
  const url = month 
    ? `/chatbots/${chatbotId}/token-usage/?month=${month}`
    : `/chatbots/${chatbotId}/token-usage/`;
  
  const response = await api.get<TokenUsage>(url);
  return response.data;
};

export const addTemporaryBoost = async (
  chatbotId: number, 
  additional_messages: number
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/temporary-boost/`, {
    additional_messages
  });
  return response.data;
};

export const updateGracePeriod = async (
  chatbotId: number, 
  grace_period_days: number
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/update-grace-period/`, {
    grace_period_days
  });
  return response.data;
};

export const updateSendingStatus = async (
  chatbotId: number, 
  is_sending_enabled: boolean
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/update-sending-status/`, {
    is_sending_enabled
  });
  return response.data;
};

export const updateMessageLimit = async (
  chatbotId: number, 
  message_limit: number
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/update-message-limit/`, {
    message_limit
  });
  return response.data;
};

export const assignLifetimePlan = async (
  chatbotId: number
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/lifetime-plan/`);
  return response.data;
};

export const revokeLifetimePlan = async (
  chatbotId: number
): Promise<{ message: string }> => {
  const response = await api.post(`/chatbots/${chatbotId}/revoke-lifetime/`);
  return response.data;
};

export const getChatbotPayments = async (
  chatbotId: number
): Promise<ChatbotPaymentsResponse> => {
  const response = await api.get<ChatbotPaymentsResponse>(
    `https://wishchat.goodwish.com.np/api/chatbot-payments/?chatbot_id=${chatbotId}`
  );
  return response.data;
};