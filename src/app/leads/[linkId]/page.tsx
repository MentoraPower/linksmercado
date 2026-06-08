"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/leads/${linkId}`).then(r => r.json()),
      fetch(`/api/links?id=${linkId}`).then(r => r.json()),
    ]).then(([leadsData, linkData]) => {
      setLeads(leadsData.leads || []);
      setLink(linkData.link || null);
    }).finally(() => setLoading(false));
  }, [linkId]);

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
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-10">

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
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Column headers */}
            <div
              className="grid w-full"
              style={{
                gridTemplateColumns: "48px 1fr 1fr 160px 170px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "12px 20px",
              }}
            >
              {["#", "Nome", "Email", "Telefone", "Cadastrado em"].map(col => (
                <span key={col} style={{
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  color: "rgba(255,255,255,0.35)",
                }}>
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {leads.map((lead, i) => (
              <div
                key={lead.id}
                className="grid w-full"
                style={{
                  gridTemplateColumns: "48px 1fr 1fr 160px 170px",
                  padding: "14px 20px",
                  borderBottom: i < leads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{lead.name}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{lead.email}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{withDDI(lead.phone)}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{formatDateShort(lead.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {leads.length > 0 && (
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {leads.length} contato{leads.length !== 1 ? "s" : ""} no total
          </p>
        )}
      </div>
    </div>
    </PasswordGate>
  );
}
