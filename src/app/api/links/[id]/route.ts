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

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();

  const { data: original, error: fetchErr } = await db
    .from("product_links")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchErr || !original) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  // Find a unique copy name: "nome - cópia", "nome - cópia 1", etc.
  const base = original.name.replace(/ - cópia(\s\d+)?$/, "");
  const { data: existing } = await db
    .from("product_links")
    .select("name")
    .ilike("name", `${base} - cópia%`);

  let copyName = `${base} - cópia`;
  if (existing && existing.length > 0) {
    copyName = `${base} - cópia ${existing.length}`;
  }

  function nameToSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }
  function randSuffix(n = 4) {
    return Array.from({ length: n }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
  }

  let slug = nameToSlug(copyName) || randSuffix();
  for (let i = 0; i < 5; i++) {
    const { data: taken } = await db.from("product_links").select("id").eq("slug", slug).single();
    if (!taken) break;
    slug = nameToSlug(copyName) + "-" + randSuffix();
  }

  const { data, error } = await db
    .from("product_links")
    .insert({ name: copyName, destination_url: original.destination_url, slug, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ link: data }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();
  const body = await req.json();
  const { active } = body;

  const { data, error } = await db
    .from("product_links")
    .update({ active })
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
