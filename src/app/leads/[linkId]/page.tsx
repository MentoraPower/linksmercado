"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Lead, ProductLink } from "@/lib/supabase";
import PasswordGate from "@/components/PasswordGate";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function withDDI(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

export default function LeadsPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const router = useRouter();
  const [link, setLink] = useState<ProductLink | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [leadsRes, linkRes] = await Promise.all([
        fetch(`/api/leads/${linkId}`),
        fetch(`/api/links?id=${linkId}`),
      ]);
      const [leadsData, linkData] = await Promise.all([leadsRes.json(), linkRes.json()]);
      if (leadsData.error) { setFetchError(leadsData.error); } else { setFetchError(""); }
      setLeads(leadsData.leads || []);
      setLink(linkData.link || null);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    fetchData();

    // Realtime subscription — fires instantly on new lead
    const channel = supabase
      .channel(`leads-${linkId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "leads",
        filter: `product_link_id=eq.${linkId}`,
      }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev]);
      })
      .subscribe();

    // Polling fallback every 3s
    const interval = setInterval(() => fetchData(true), 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchData, linkId]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function buildRows() {
    return leads.map(l => ({
      Nome: l.name,
      Email: l.email,
      Telefone: withDDI(l.phone),
      "Data e Hora": formatDateTime(l.created_at),
      Produto: link?.name ?? "",
    }));
  }

  function exportCSV() {
    setExportOpen(false);
    const rows = buildRows();
    const header = Object.keys(rows[0]).join(",");
    const body = rows.map(r =>
      Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["﻿" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos-${link?.name ?? linkId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportExcel() {
    setExportOpen(false);
    const { utils, writeFile } = await import("xlsx");
    const rows = buildRows();
    const ws = utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 28 }, // Nome
      { wch: 32 }, // Email
      { wch: 18 }, // Telefone
      { wch: 22 }, // Data e Hora
      { wch: 28 }, // Produto
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Contatos");
    writeFile(wb, `contatos-${link?.name ?? linkId}.xlsx`);
  }

  return (
    <PasswordGate>
    <div className="relative z-10 min-h-screen">
      <div className="w-full px-6 pt-10 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Contatos</h1>

          <div className="flex items-center gap-3">
            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
                <button
                  onClick={() => leads.length > 0 && setExportOpen(!exportOpen)}
                  className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
                  style={{ opacity: leads.length === 0 ? 0.4 : 1, cursor: leads.length === 0 ? "default" : "pointer" }}
                >
                  Exportar
                  <ChevronDown size={13} style={{ opacity: 0.6 }} />
                </button>

                {exportOpen && (
                  <div
                    className="absolute right-0 top-11 z-50 w-44 rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(14,14,14,0.98)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                    }}
                  >
                    <button
                      onClick={exportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FileText size={14} />
                      CSV
                    </button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <button
                      onClick={exportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FileSpreadsheet size={14} />
                      Excel (.xlsx)
                    </button>
                  </div>
                )}
            </div>

            {/* Voltar */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl"
              style={{ background: "#fff", color: "#000" }}
            >
              <ArrowLeft size={15} />
              Voltar
            </button>
          </div>
        </div>

        {/* API error */}
        {fetchError && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.9)" }}>
            Erro: {fetchError}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-7 h-7 opacity-25" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-white/40 font-medium">Nenhum contato ainda</p>
            <p className="text-white/25 text-sm">Compartilhe o link de captura para começar</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            <table style={{ minWidth: 620, width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["#", "Nome", "Email", "Telefone", "Cadastrado em"].map(col => (
                    <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: i < leads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{i + 1}</td>
                    <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{lead.name}</td>
                    <td style={{ padding: "13px 16px", fontSize: 14, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", textDecoration: "none", pointerEvents: "none", userSelect: "text" }}>{lead.email}</td>
                    <td style={{ padding: "13px 16px", fontSize: 14, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", pointerEvents: "none" }}>{withDDI(lead.phone)}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{formatDateShort(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
    </PasswordGate>
  );
}
