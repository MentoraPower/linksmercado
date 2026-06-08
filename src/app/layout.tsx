import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkPro — Capture de Leads",
  description: "Sistema de links com captura de leads integrada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="animated-gradient noise min-h-screen">{children}</body>
    </html>
  );
}
