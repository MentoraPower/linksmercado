"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Users, Copy, Trash2, ExternalLink, MoreHorizontal } from "lucide-react";
import type { ProductLink } from "@/lib/supabase";

type Props = {
  link: ProductLink;
  onEdit: () => void;
  onDeleted: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LinkCard({ link, onEdit, onDeleted, showToast }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [active, setActive] = useState(link.active ?? true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const captureUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.slug}`;

  useEffect(() => {
    setActive(link.active ?? true);
  }, [link.active]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(captureUrl);
    showToast("Link copiado!", "success");
    setOpen(false);
  }

  async function handleToggle() {
    setToggling(true);
    const newActive = !active;
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      if (!res.ok) throw new Error();
      setActive(newActive);
      showToast(newActive ? "Link ativado!" : "Link desativado!", "success");
    } catch {
      showToast("Erro ao atualizar link", "error");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Link deletado!", "success");
      onDeleted();
    } catch {
      showToast("Erro ao deletar", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setOpen(false);
    }
  }

  return (
    <div className="w-full flex items-center px-5 py-4 gap-3" style={{ minWidth: 0 }}>
      {/* Nome */}
      <span className="font-semibold text-white text-sm truncate flex-1">{link.name}</span>

      {/* Data */}
      <span className="text-sm shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
        {formatDate(link.created_at)}
      </span>

      {/* Toggle ativo/inativo */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        title={active ? "Desativar link" : "Ativar link"}
        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
          color: active ? "#4ade80" : "rgba(239,68,68,0.7)",
          border: `1px solid ${active ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
          opacity: toggling ? 0.5 : 1,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: active ? "#4ade80" : "rgba(239,68,68,0.7)" }}
        />
        {active ? "Ativo" : "Inativo"}
      </button>

      {/* 3 pontinhos */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => { setOpen(!open); setShowDeleteConfirm(false); }}
          className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
        >
          <MoreHorizontal size={16} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-10 z-50 w-48 rounded-xl overflow-hidden"
            style={{
              background: "rgba(14,14,14,0.97)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Edit2 size={14} />
              Editar
            </button>

            <button
              onClick={() => { router.push(`/leads/${link.id}`); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Users size={14} />
              Ver Leads
              {(link.leads_count ?? 0) > 0 && (
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(255,224,51,0.15)", color: "#ffe033" }}
                >
                  {link.leads_count}
                </span>
              )}
            </button>

            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Copy size={14} />
              Copiar Link
            </button>

            <a
              href={captureUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ExternalLink size={14} />
              Abrir Página
            </a>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{ color: "rgba(239,68,68,0.7)" }}
              >
                <Trash2 size={14} />
                Deletar
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors"
                style={{ color: "#f87171", background: "rgba(239,68,68,0.08)" }}
              >
                <Trash2 size={14} />
                {deleting ? "Deletando..." : "Confirmar exclusão"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
