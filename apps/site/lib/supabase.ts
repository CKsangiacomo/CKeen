import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types for widget_instances table
export interface WidgetInstance {
  id: string;
  workspace_id: string | null;
  type_id: string;
  public_id: string;
  version: number;
  status: string;
  config: Record<string, any>;
  allowed_domains: string[];
  show_badge: boolean;
  created_by: string;
  created_at: string;
}

export interface CreateWidgetInstancePayload {
  workspace_id: string | null;
  type_id: string;
  public_id: string;
  status: string;
  config: Record<string, any>;
  allowed_domains?: string[];
  show_badge?: boolean;
  created_by?: string;
}
