import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Biteti Indicações",
  description: "Biteti Indicações",
  other: {
    "format-detection": "telephone=no, email=no, address=no",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="animated-gradient noise min-h-screen">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
