"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] toast flex items-center gap-3 px-4 py-3 min-w-[280px]">
      {type === "success" ? (
        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-400 shrink-0" />
      )}
      <span className="text-sm font-medium text-white flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/40 hover:text-white/80 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
