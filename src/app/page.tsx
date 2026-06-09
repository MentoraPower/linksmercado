"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Link2, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductLink } from "@/lib/supabase";
import LinkCard from "@/components/LinkCard";
import CreateLinkModal from "@/components/CreateLinkModal";
import EditLinkModal from "@/components/EditLinkModal";
import Toast from "@/components/Toast";
import PasswordGate from "@/components/PasswordGate";

type ToastState = { message: string; type: "success" | "error" } | null;

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editLink, setEditLink] = useState<ProductLink | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.links || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filtered = links.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.slug.includes(search.toLowerCase())
  );

  return (
    <PasswordGate>
    <div className="relative z-10 min-h-screen">
      {/* Main content */}
      <div className="w-full px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
            <input
              className="glass-input-plain pl-11"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm shrink-0"
          >
            <Plus size={16} />
            Criar Link
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("lp_auth"); router.replace("/acesso"); }}
            className="btn-ghost w-9 h-9 flex items-center justify-center shrink-0"
            title="Sair"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Link grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-8 h-8 opacity-25" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : links.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,224,51,0.08), rgba(255,224,51,0.03))",
                border: "1px solid rgba(255,224,51,0.12)",
              }}
            >
              <Link2 size={40} style={{ color: "rgba(255,224,51,0.4)" }} />
            </div>
            <div className="text-center max-w-sm">
              <h2 className="text-2xl font-bold text-white mb-3">Nenhum link ainda</h2>
              <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
                Crie seu primeiro link de captura e comece a coletar leads de forma automática
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-gold flex items-center gap-2 px-6 py-3 text-base"
            >
              <Plus size={18} />
              Criar Primeiro Link
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            Nenhum link encontrado para "{search}"
          </div>
        ) : (
          <div
            className="w-full rounded-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "visible" }}
          >
            {/* Header de colunas */}
            <div
              className="grid w-full px-5 py-3"
              style={{
                gridTemplateColumns: "1fr 140px 40px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px 16px 0 0",
              }}
            >
              {["Nome", "Criado em", ""].map((col) => (
                <span key={col} style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "rgba(255,255,255,0.35)",
                }}>
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((link, i) => (
              <div
                key={link.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              >
                <LinkCard
                  link={link}
                  onEdit={() => setEditLink(link)}
                  onDeleted={fetchLinks}
                  showToast={showToast}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateLinkModal
          onClose={() => { setShowCreate(false); window.scrollTo(0, 0); }}
          onCreated={fetchLinks}
          showToast={showToast}
        />
      )}
      {editLink && (
        <EditLinkModal
          link={editLink}
          onClose={() => { setEditLink(null); window.scrollTo(0, 0); }}
          onUpdated={fetchLinks}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    </PasswordGate>
  );
}
