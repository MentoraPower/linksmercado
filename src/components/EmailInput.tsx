"use client";

import { useEffect, useRef, useState } from "react";

const DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function EmailInput({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focused) { setSuggestions([]); return; }

    const atIdx = value.indexOf("@");
    if (atIdx === -1) { setSuggestions([]); return; }

    const afterAt = value.slice(atIdx + 1).toLowerCase();
    const filtered = afterAt
      ? DOMAINS.filter(d => d.startsWith(afterAt) && d !== afterAt)
      : DOMAINS;

    setSuggestions(filtered);
  }, [value, focused]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function pick(domain: string) {
    const atIdx = value.indexOf("@");
    const newVal = (atIdx !== -1 ? value.slice(0, atIdx + 1) : value + "@") + domain;
    onChange(newVal);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        className="glass-input"
        placeholder="Seu melhor email"
        type="email"
        inputMode="email"
        autoComplete="off"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />

      {suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden"
          style={{
            top: "calc(100% + 6px)",
            background: "rgba(10,10,10,0.98)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          }}
        >
          {suggestions.map(domain => {
            const atIdx = value.indexOf("@");
            const local = atIdx !== -1 ? value.slice(0, atIdx) : value;
            return (
              <button
                key={domain}
                type="button"
                onMouseDown={() => pick(domain)}
                className="w-full flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{local}</span>
                <span style={{ color: "#ffe033" }}>@</span>
                <span>{domain}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
