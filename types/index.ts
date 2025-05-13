// Organization Types
export interface Organization {
  id: number;
  name: string;
}

export interface OrganizationWithStats extends Organization {
  organization_token_count: number;
  organization_members: { email: string }[];
  chatbots: ChatbotBasic[];
}

export interface OrganizationList {
  "total organizations": number;
  organizations: Organization[];
}

export interface OrganizationOverview {
  organization_count: number;
  organizations: OrganizationWithStats[];
}

// Chatbot Types
export interface ChatbotBasic {
  id: number;
  name: string;
  chatbot_token_count?: number;
}

export interface Quota {
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

export interface Chatbot {
  id: number;
  organization: Organization;
  name: string;
  api_key: string;
  azure_index_name: string;
  created_at: string;
  updated_at: string;
  quota: Quota;
  system_prompt: string | null;
  domain_name: string | null;
}

export interface ChatbotList {
  Status: string;
  Chatbots: Chatbot[];
}

// Token Usage Types
export interface TokenUsage {
  status: string;
  month?: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
}

export interface ChatbotTokenUsage extends TokenUsage {
  chatbot_id: number;
  chatbot_name: string;
  year: number;
  month: number;
}

// Subscription Plan Types
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

export interface SubscriptionPlansResponse {
  message: string;
  plans: SubscriptionPlan[];
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

// Payment Types
export interface Payment {
  id: number;
  chatbot: number;
  amount: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  status: string;
}

export interface ChatbotPayments {
  chatbot_id: number;
  chatbot_name: string;
  organization: string;
  transactions: Payment[];
}

// User Types
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

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
  has_organization: boolean;
  is_superuser: boolean;
  is_staff: boolean;
}

export interface CreateStaffRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UpdateProfileRequest {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

// Update Requests
export interface UpdateMessageLimitRequest {
  message_limit: number;
}

export interface UpdateGracePeriodRequest {
  grace_period_days: number;
}

export interface UpdateSendingStatusRequest {
  is_sending_enabled: boolean;
}

export interface TemporaryBoostRequest {
  additional_messages: number;
}