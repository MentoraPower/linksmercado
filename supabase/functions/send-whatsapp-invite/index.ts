import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const UNICHAT_TOKEN = "8946ddcf-da4d-4e49-8182-9ca862ac5aad";
const TEMPLATE_ID = "982349684553556";
const UNICHAT_URL = "https://unnichat.com.br/api/meta/templates";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const { phone, name } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "phone obrigatório" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Strip to digits only; prepend 55 if not already present
    const digits = String(phone).replace(/\D/g, "");
    const formatted = digits.startsWith("55") ? digits : `55${digits}`;

    const payload: Record<string, unknown> = {
      phone: formatted,
      templateId: TEMPLATE_ID,
      bodyParameters: name ? [{ text: String(name), type: "text" }] : [],
      headerParameters: [],
      urlButtonParameters: [],
    };

    const res = await fetch(UNICHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UNICHAT_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
