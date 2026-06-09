"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CornerFrame from "@/components/CornerFrame";

type LinkData = {
  id: string;
  name: string;
  destination_url: string;
  slug: string;
};

export default function CapturePage() {
  const { slug } = useParams<{ slug: string }>();
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [notFound, setNotFound] = useState(false);
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
        if (d.link) setLinkData(d.link);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

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
      setTimeout(() => {
        window.location.href = linkData.destination_url;
      }, 1800);
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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Link não encontrado</h1>
        <p className="text-white/40 text-center">
          Este link não existe ou foi removido.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 animate-fade-in">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle2 size={36} className="text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Perfeito!</h2>
          <p className="text-white/50">Redirecionando você agora...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{
                background: "#ffe033",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
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
            <input
              className="glass-input"
              placeholder="Seu melhor email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldAlert([]); }}
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
