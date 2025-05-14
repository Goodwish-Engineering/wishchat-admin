import api from './axios';
import { ActivityLogsResponse } from '../types';

export const getActivityLogs = async (): Promise<ActivityLogsResponse> => {
  const response = await api.get<ActivityLogsResponse>('/activity-logs/');
  return response.data;
};