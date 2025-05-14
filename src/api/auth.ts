import api from './axios';
import { LoginCredentials, LoginResponse, User } from '../types';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login/', credentials);
  return response.data;
};

export const getAdminUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users/admins/');
  return response.data;
};

export const createStaff = async (data: {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  const response = await api.post('/staff/create/', data);
  return response.data;
};

export const updateProfile = async (data: {
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}) => {
  const response = await api.patch('/staff/profile/update/', data);
  return response.data;
};