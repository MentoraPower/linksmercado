export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: { linkId: string } }
) {
  const linkId = context.params.linkId;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${url}/rest/v1/leads?product_link_id=eq.${linkId}&order=created_at.desc&select=*`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const leads = await res.json();
  return NextResponse.json({ leads });
}
