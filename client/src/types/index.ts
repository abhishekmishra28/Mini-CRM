// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  total_spent: number;
  order_count: number;
  last_order_date: string | null;
  first_order_date: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  items: OrderItem[];
  channel: 'online' | 'in-store' | 'app';
  status: 'completed' | 'returned' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

// ─── Segment Types ────────────────────────────────────────────────────────────

export type SegmentOperator = 'AND' | 'OR';
export type ConditionField =
  | 'total_spent'
  | 'order_count'
  | 'last_order_date'
  | 'first_order_date'
  | 'city'
  | 'tags';
export type ConditionOp =
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'contains'
  | 'days_ago_gt'
  | 'days_ago_lt';

export interface SegmentCondition {
  id: string;
  field: ConditionField;
  op: ConditionOp;
  value: string | number;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  operator: SegmentOperator;
  customer_count: number;
  created_at: string;
  ai_generated?: boolean;
}

// ─── Campaign Types ───────────────────────────────────────────────────────────

export type CampaignChannel = 'whatsapp' | 'sms' | 'email' | 'rcs';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'completed';

export interface Campaign {
  id: string;
  name: string;
  segment_id: string;
  segment_name?: string;
  channel: CampaignChannel;
  message: string;
  status: CampaignStatus;
  total_sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  created_at: string;
  sent_at?: string;
  ai_generated_message?: boolean;
}

// ─── Communication / Receipt Types ───────────────────────────────────────────

export type CommStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'opened'
  | 'clicked';

export interface Communication {
  id: string;
  campaign_id: string;
  customer_id: string;
  customer_name?: string;
  channel: CampaignChannel;
  message: string;
  status: CommStatus;
  created_at: string;
  updated_at: string;
}

// ─── AI Chat Types ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: 'create_segment' | 'create_campaign' | 'show_insights';
    data?: any;
  };
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  channel: CampaignChannel;
  total_sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}
