export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { linkId: string } }
) {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("leads")
    .select("*")
    .eq("product_link_id", params.linkId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data || [] });
}
