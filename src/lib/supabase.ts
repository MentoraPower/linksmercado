import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export type ProductLink = {
  id: string;
  name: string;
  destination_url: string;
  slug: string;
  created_at: string;
  active: boolean;
  leads_count?: number;
};

export type Lead = {
  id: string;
  product_link_id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};
