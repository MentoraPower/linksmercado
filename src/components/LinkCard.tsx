"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Users, Copy, Trash2, ExternalLink, MoreHorizontal, CopyPlus } from "lucide-react";
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
  const [duplicating, setDuplicating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [active, setActive] = useState(link.active ?? true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  async function handleDuplicate() {
    setDuplicating(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      showToast("Link duplicado!", "success");
      onDeleted();
    } catch {
      showToast("Erro ao duplicar", "error");
    } finally {
      setDuplicating(false);
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

      {/* Toggle switch */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        title={active ? "Desativar link" : "Ativar link"}
        style={{
          flexShrink: 0,
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 11,
          background: active ? "#22c55e" : "rgba(255,255,255,0.12)",
          border: "none",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: toggling ? "wait" : "pointer",
          transition: "background 0.25s ease",
          opacity: toggling ? 0.6 : 1,
          padding: 0,
          overflow: "hidden",
        } as React.CSSProperties}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: active ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.25s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </button>

      {/* 3 pontinhos */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          ref={btnRef}
          onClick={() => {
            if (!open && btnRef.current) {
              const r = btnRef.current.getBoundingClientRect();
              setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
            }
            setOpen(!open);
            setShowDeleteConfirm(false);
          }}
          className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
        >
          <MoreHorizontal size={16} />
        </button>

        {open && (
          <div
            className="fixed z-50 w-48 rounded-xl overflow-hidden"
            style={{
              top: dropPos.top,
              right: dropPos.right,
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

            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <CopyPlus size={14} />
              {duplicating ? "Duplicando..." : "Duplicar"}
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
