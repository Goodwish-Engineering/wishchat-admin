import api from './axios';
import { TokenUsage } from '../types';

export const getTokenUsage = async (month?: string): Promise<TokenUsage> => {
  const url = month ? `/token-usage/?month=${month}` : '/token-usage/';
  const response = await api.get<TokenUsage>(url);
  return response.data;
};