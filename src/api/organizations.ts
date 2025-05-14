import api from './axios';
import { OrganizationOverview, OrganizationList, Chatbot, TokenUsage } from '../types';

export const getOrganizationOverview = async (): Promise<OrganizationOverview> => {
  const response = await api.get<OrganizationOverview>('/organization-overview');
  return response.data;
};

export const getOrganizationList = async (): Promise<OrganizationList> => {
  const response = await api.get<OrganizationList>('/organizations/list/');
  return response.data;
};

export const getOrganizationChatbots = async (organizationId: number): Promise<{ Status: string, Chatbots: Chatbot[] }> => {
  const response = await api.get<{ Status: string, Chatbots: Chatbot[] }>(`/${organizationId}/chatbots/list/`);
  return response.data;
};

export const getOrganizationTokenUsage = async (organizationId: number): Promise<TokenUsage> => {
  const response = await api.get<TokenUsage>(`/${organizationId}/token-usage`);
  return response.data;
};