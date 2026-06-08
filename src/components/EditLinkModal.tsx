"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ProductLink } from "@/lib/supabase";

type Props = {
  link: ProductLink;
  onClose: () => void;
  onUpdated: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
};

export default function EditLinkModal({ link, onClose, onUpdated, showToast }: Props) {
  const [name, setName] = useState(link.name);
  const [url, setUrl] = useState(link.destination_url);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), destination_url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      showToast("Link atualizado com sucesso!", "success");
      onUpdated();
      onClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl"
        style={{ background: "rgba(10,10,10,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-lg font-bold text-white">Editar Link</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="divider my-5" />

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div>
            <label className="field-label">Nome do Produto</label>
            <input
              className="glass-input"
              placeholder="Nome do produto"
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

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 text-sm font-semibold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex-1 py-3 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
