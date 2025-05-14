import api from './axios';
import { CouponCode, CreateCouponRequest } from '../types';

export const getActiveCoupons = async (): Promise<CouponCode[]> => {
  const response = await api.get<CouponCode[]>('/set/coupon-codes/active');
  return response.data;
};

export const createCoupon = async (
  couponData: CreateCouponRequest
): Promise<{ message: string }> => {
  const response = await api.post('/set/coupon-codes/', couponData);
  return response.data;
};