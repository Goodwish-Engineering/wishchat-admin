import api from './axios';
import { 
  CreateSubscriptionPlanRequest, 
  CreateSubscriptionPlanResponse, 
  SubscriptionPlansResponse 
} from '../types';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  const response = await api.get<SubscriptionPlansResponse>('/subscription-plans/');
  return response.data;
};

export const createSubscriptionPlan = async (
  planData: CreateSubscriptionPlanRequest
): Promise<CreateSubscriptionPlanResponse> => {
  const response = await api.post<CreateSubscriptionPlanResponse>(
    '/subscription-plans/create/', 
    planData
  );
  return response.data;
};

export const deleteSubscriptionPlan = async (planId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/subscription-plans/${planId}/delete/`);
  return response.data;
};