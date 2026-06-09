"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import EmailInput from "@/components/EmailInput";
import CornerFrame from "@/components/CornerFrame";
import { supabase } from "@/lib/supabase";

type LinkData = {
  id: string;
  name: string;
  destination_url: string;
  slug: string;
};

const PLAYER_ID = "ifr_68223ee79a40b1a0cd9a0cfa";
const EMBED_URL = `https://scripts.converteai.net/2fe3fa7a-4b6e-44f7-be18-0c3cce42c4c0/players/68223ee79a40b1a0cd9a0cfa/v4/embed.html`;

function DoneScreen({ destinationUrl }: { destinationUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Load converteai SDK
    if (!document.querySelector(`script[src*="smartplayer-wc"]`)) {
      const s = document.createElement("script");
      s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
      s.async = true;
      document.head.appendChild(s);
    }
    // Preload links
    const preloads = [
      { href: `${EMBED_URL}`, as: undefined },
      { href: `https://scripts.converteai.net/2fe3fa7a-4b6e-44f7-be18-0c3cce42c4c0/players/68223ee79a40b1a0cd9a0cfa/v4/player.js`, as: "script" },
      { href: "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js", as: "script" },
    ];
    preloads.forEach(({ href, as }) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "preload";
      l.href = href;
      if (as) l.setAttribute("as", as);
      document.head.appendChild(l);
    });
  }, []);

  function loadIframe(e: React.SyntheticEvent<HTMLIFrameElement>) {
    const iframe = e.currentTarget;
    iframe.onload = null;
    const search = typeof window !== "undefined" ? (window.location.search || "?") : "?";
    const vl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
    iframe.src = `${EMBED_URL}${search}&vl=${vl}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6">
      {/* Video player */}
      <div id={`${PLAYER_ID}_wrapper`} style={{ margin: "0 auto", width: "100%", maxWidth: 400 }}>
        <div style={{ position: "relative", paddingTop: "177.77777777777777%", width: "100%" }}>
          <iframe
            ref={iframeRef}
            id={PLAYER_ID}
            frameBorder={0}
            allowFullScreen
            src="about:blank"
            onLoad={loadIframe}
            referrerPolicy="origin"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 400 }}>
        <a
          href={destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold w-full py-4 text-base font-bold text-center rounded-xl"
        >
          Quero receber o convite
        </a>
        <a
          href={destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 text-base font-semibold text-center rounded-xl transition-colors"
          style={{
            background: "transparent",
            border: "1px solid #FFFFFF13",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Não quero
        </a>
      </div>
    </div>
  );
}

export default function CapturePage() {
  const { slug } = useParams<{ slug: string }>();
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldAlert, setFieldAlert] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/links?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.link) {
          if (d.link.active === false) { setDeactivated(true); }
          else { setLinkData(d.link); }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Realtime for instant updates
  useEffect(() => {
    if (!linkData) return;
    const watchId = linkData.id;
    const channel = supabase
      .channel(`link-watch-${watchId}`)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "product_links" }, (payload) => {
        const deleted = payload.old as { id: string };
        if (deleted.id !== watchId) return;
        setNotFound(true);
        setLinkData(null);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "product_links" }, (payload) => {
        const updated = payload.new as { id: string; active: boolean };
        if (updated.id !== watchId) return;
        if (updated.active === false) { setDeactivated(true); setLinkData(null); }
        else { setDeactivated(false); setLinkData(prev => prev ? { ...prev, ...payload.new } : prev); }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [linkData?.id]);

  // Polling sempre ativo pelo slug — detecta desativar, ativar e excluir
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/links?slug=${slug}`);
        const d = await res.json();
        if (!d.link) {
          setNotFound(true);
          setLinkData(null);
          setDeactivated(false);
        } else if (d.link.active === false) {
          setDeactivated(true);
          setLinkData(null);
        } else {
          setDeactivated(false);
          setNotFound(false);
          setLinkData(d.link);
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [slug, loading]);

  const handlePhoneChange = useCallback((v: string) => setPhone(v), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!linkData) return;

    const missing: string[] = [];
    if (!name.trim()) missing.push("Nome completo");
    if (!email.trim()) missing.push("Email");
    if (!phone.trim()) missing.push("Telefone");
    if (missing.length > 0) { setFieldAlert(missing); return; }

    setFieldAlert([]);
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_link_id: linkData.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar dados");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 opacity-25" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (deactivated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-2xl font-bold text-white">Este link foi desativado</h1>
        <p className="text-white/40 text-center">Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-2xl font-bold text-white">Este link foi excluído!</h1>
        <p className="text-white/40 text-center">Este link não existe ou foi removido.</p>
      </div>
    );
  }

  if (done && linkData) {
    return <DoneScreen destinationUrl={linkData.destination_url} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 px-6 py-16">


      {linkData && (
        <p className="text-center text-sm font-semibold mb-6" style={{ letterSpacing: "0.04em" }}>
          <span style={{ color: "#ffe033" }}>[</span>
          <span className="text-white mx-2">{linkData.name}</span>
          <span style={{ color: "#ffe033" }}>]</span>
        </p>
      )}

      <CornerFrame className="w-full max-w-lg py-12 px-10">
        <p className="text-center text-base font-semibold mb-8 mx-auto" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.5, maxWidth: 300 }}>
          Preencha suas informações pra acessar o produto que a Biteti indicou!
        </p>
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-5">
          <div>
            <input
              className="glass-input"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldAlert([]); }}
              autoFocus
            />
          </div>

          <div>
            <EmailInput
              value={email}
              onChange={(v) => { setEmail(v); setFieldAlert([]); }}
            />
          </div>

          <div>
            <PhoneInput onChange={handlePhoneChange} />
          </div>

          {fieldAlert.length > 0 && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)" }}
            >
              <p className="text-sm font-medium" style={{ color: "#fca5a5" }}>
                Preencha: <span className="font-bold">{fieldAlert.join(", ")}</span>
              </p>
              <button
                type="button"
                onClick={() => setFieldAlert([])}
                className="shrink-0"
                style={{ color: "rgba(252,165,165,0.6)", lineHeight: 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </CornerFrame>

      <p className="text-xs text-center mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
        Suas informações estão seguras e não serão compartilhadas
      </p>
    </div>
  );
}
