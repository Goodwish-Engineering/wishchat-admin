// Auth types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string | null;
  organization: number | null;
  is_owner: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
  has_organization: boolean;
  is_superuser: boolean;
  is_staff: boolean;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

// Organization types
export interface OrganizationMember {
  email: string;
}

export interface Chatbot {
  id: number;
  name: string;
  chatbot_token_count: number;
  api_key?: string;
  azure_index_name?: string;
  created_at?: string;
  updated_at?: string;
  domain_name?: string | null;
  system_prompt?: string | null;
  organization?: {
    id: number;
    name: string;
  };
  quota?: ChatbotQuota;
}

export interface ChatbotQuota {
  id: number;
  chatbot: number;
  subscription_plan: number | null;
  messages_used: number;
  message_limit: number;
  temporary_message_boost: number;
  is_trial: boolean;
  trial_start_date: string;
  trial_end_date: string;
  is_paid: boolean;
  subscription_end_date: string | null;
  last_reset: string;
  is_trial_valid: boolean;
  is_subscription_valid: boolean;
  can_send_message: boolean;
  grace_period_days: number;
  is_sending_enabled: boolean;
  last_payment_date: string | null;
}

export interface Organization {
  id: number;
  name: string;
  organization_token_count: number;
  organization_members: OrganizationMember[];
  chatbots: Chatbot[];
}

export interface OrganizationOverview {
  organization_count: number;
  organizations: Organization[];
}

export interface OrganizationListItem {
  id: number;
  name: string;
}

export interface OrganizationList {
  "total organizations": number;
  organizations: OrganizationListItem[];
}

// Token usage types
export interface TokenUsage {
  status: string;
  month?: string;
  year?: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  chatbot_id?: number;
  chatbot_name?: string;
}

// Subscription types
export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  message_limit: number;
  trial_days: number;
  is_active: boolean;
  is_lifetime: boolean;
  auto_reset_quota: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  price: number;
  message_limit: number;
  trial_days: number;
  is_active: boolean;
  is_lifetime: boolean;
  auto_reset_quota: boolean;
}

export interface CreateSubscriptionPlanResponse {
  message: string;
  plan: SubscriptionPlan;
}

export interface SubscriptionPlansResponse {
  message: string;
  plans: SubscriptionPlan[];
}

// Activity logs types
export interface ActivityLog {
  id: number;
  activity: string;
  timestamp: string;
}

export interface ActivityLogsResponse {
  message: string;
  logs: ActivityLog[];
}

// Chatbot management types
export interface UpdateBoostRequest {
  additional_messages: number;
}

export interface UpdateGracePeriodRequest {
  grace_period_days: number;
}

export interface UpdateSendingStatusRequest {
  is_sending_enabled: boolean;
}

export interface UpdateMessageLimitRequest {
  message_limit: number;
}

// Staff management types
export interface CreateStaffRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UpdateProfileRequest {
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

// Payment types
export interface ChatbotPaymentTransaction {
  id: number;
  amount: string;
  date: string;
  plan_name: string;
}

export interface ChatbotPaymentsResponse {
  chatbot_id: number;
  chatbot_name: string;
  organization: string;
  transactions: ChatbotPaymentTransaction[];
}

// Coupon types
export interface CouponCode {
  id: number;
  code: string;
  discount_percent: string;
  max_usage: number;
  times_used: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateCouponRequest {
  code: string;
  discount_percent: number;
  max_usage: number;
  is_active: boolean;
}