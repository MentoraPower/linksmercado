export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  const body = await req.json();
  const { product_link_id, name, email, phone } = body;

  if (!product_link_id || !name || !email || !phone) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }

  const { data, error } = await db
    .from("leads")
    .insert({ product_link_id, name, email, phone })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data }, { status: 201 });
}
