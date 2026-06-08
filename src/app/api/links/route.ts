import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function generateSlug(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function GET(req: NextRequest) {
  const db = supabaseAdmin();
  const slug = req.nextUrl.searchParams.get("slug");

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const { data, error } = await db.from("product_links").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ link: null });
    return NextResponse.json({ link: data });
  }

  if (slug) {
    const { data, error } = await db.from("product_links").select("*").eq("slug", slug).single();
    if (error || !data) return NextResponse.json({ link: null });
    return NextResponse.json({ link: data });
  }

  const { data: links, error } = await db
    .from("product_links")
    .select("*, leads(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const formatted = (links || []).map((l) => ({
    ...l,
    leads_count: l.leads?.[0]?.count ?? 0,
    leads: undefined,
  }));

  return NextResponse.json({ links: formatted });
}

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  const body = await req.json();
  const { name, destination_url } = body;

  if (!name || !destination_url) {
    return NextResponse.json({ error: "Nome e URL são obrigatórios" }, { status: 400 });
  }

  let slug = generateSlug();
  let attempts = 0;
  while (attempts < 5) {
    const { data } = await db.from("product_links").select("id").eq("slug", slug).single();
    if (!data) break;
    slug = generateSlug();
    attempts++;
  }

  const { data, error } = await db
    .from("product_links")
    .insert({ name, destination_url, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ link: data }, { status: 201 });
}
