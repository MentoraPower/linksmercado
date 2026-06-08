"use client";

import { useEffect, useState } from "react";
import { X, Users, Mail, Phone, Calendar, Download, Search } from "lucide-react";
import type { Lead, ProductLink } from "@/lib/supabase";

type Props = {
  link: ProductLink;
  onClose: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsModal({ link, onClose }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/leads/${link.id}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, [link.id]);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
  );

  function exportCSV() {
    const header = "Nome,Email,Telefone,Data\n";
    const rows = leads.map((l) => `"${l.name}","${l.email}","${l.phone}","${formatDate(l.created_at)}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${link.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,224,51,0.12)", border: "1px solid rgba(255,224,51,0.2)" }}
            >
              <Users size={18} style={{ color: "#ffe033" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{link.name}</h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {loading ? "Carregando..." : `${leads.length} lead${leads.length !== 1 ? "s" : ""} capturado${leads.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <button
                onClick={exportCSV}
                className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs font-semibold"
              >
                <Download size={13} />
                Exportar CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="divider my-4" />

        {/* Search */}
        {leads.length > 0 && (
          <div className="px-6 pb-4">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                className="glass-input pl-10"
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-7 h-7 opacity-30" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Users size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white/60">Nenhum lead ainda</p>
                <p className="text-sm text-white/30 mt-1">
                  Compartilhe seu link de captura para começar a coletar leads
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">
              Nenhum resultado para "{search}"
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <span className="flex items-center gap-1.5">
                        <Users size={10} />
                        Nome
                      </span>
                    </th>
                    <th>
                      <span className="flex items-center gap-1.5">
                        <Mail size={10} />
                        Email
                      </span>
                    </th>
                    <th>
                      <span className="flex items-center gap-1.5">
                        <Phone size={10} />
                        Telefone
                      </span>
                    </th>
                    <th>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={10} />
                        Data
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id}>
                      <td className="font-medium text-white">{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td style={{ color: "rgba(255,255,255,0.4)" }}>{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
