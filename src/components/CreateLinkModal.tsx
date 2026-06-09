"use client";

import { useState } from "react";
import { X, Copy, ExternalLink, CheckCircle2 } from "lucide-react";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
};

export default function CreateLinkModal({ onClose, onCreated, showToast }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), destination_url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar link");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setCreatedUrl(`${origin}/${data.link.slug}`);
      onCreated();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao criar link", "error");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl"
        style={{
          background: "rgba(10,10,10,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-lg font-bold text-white">
            {createdUrl ? "Link criado!" : "Criar Novo Link"}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        <div className="divider my-5" />

        {createdUrl ? (
          /* Success state */
          <div className="px-8 pb-8 space-y-6">
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle2 size={28} className="text-green-400" />
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Seu link de captura está pronto
              </p>
            </div>

            {/* Link bar */}
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <span
                className="flex-1 truncate text-sm font-mono"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {createdUrl}
              </span>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                  color: copied ? "#4ade80" : "rgba(255,255,255,0.5)",
                }}
                title="Copiar link"
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                title="Abrir link"
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <button onClick={onClose} className="btn-gold w-full py-3 text-sm">
              Fechar
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            <div>
              <label className="field-label">Nome do Produto</label>
              <input
                className="glass-input"
                placeholder="Produto X"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="field-label">URL de Destino</label>
              <input
                className="glass-input"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !url.trim()}
              className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando...
                </>
              ) : (
                "Criar Link"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
