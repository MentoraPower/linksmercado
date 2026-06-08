export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();
  const body = await req.json();
  const { name, destination_url } = body;

  if (!name || !destination_url) {
    return NextResponse.json({ error: "Nome e URL são obrigatórios" }, { status: 400 });
  }

  const { data, error } = await db
    .from("product_links")
    .update({ name, destination_url })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ link: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();

  const { error } = await db
    .from("product_links")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
