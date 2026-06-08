"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const KEY = "lp_auth";
const PWD = "BitetiTec";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(KEY) === "1");
    setChecked(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value === PWD) {
      sessionStorage.setItem(KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setShaking(true);
      setValue("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  if (!checked) return null;
  if (authed) return <>{children}</>;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: "#000" }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-8 ${shaking ? "animate-shake" : ""}`}
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Digite a senha para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input
              className="glass-input pr-12"
              type={show ? "text" : "password"}
              placeholder="Senha de acesso"
              style={{ fontSize: 16 }}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-center text-sm" style={{ color: "rgba(239,68,68,0.8)" }}>
              Senha incorreta
            </p>
          )}

          <button type="submit" className="btn-gold w-full py-3 text-sm">
            Entrar
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  );
}
