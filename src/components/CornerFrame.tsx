import React from "react";

const C = "1.5px solid rgba(255,224,51,0.55)";
const R = 5;
const S = 32;

export default function CornerFrame({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative ${className ?? ""}`} style={style}>
      {/* top-left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: S, height: S, borderTop: C, borderLeft: C, borderRadius: `${R}px 0 0 0`, pointerEvents: "none" }} />
      {/* top-right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: S, height: S, borderTop: C, borderRight: C, borderRadius: `0 ${R}px 0 0`, pointerEvents: "none" }} />
      {/* bottom-left */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: S, height: S, borderBottom: C, borderLeft: C, borderRadius: `0 0 0 ${R}px`, pointerEvents: "none" }} />
      {/* bottom-right */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: S, height: S, borderBottom: C, borderRight: C, borderRadius: `0 0 ${R}px 0`, pointerEvents: "none" }} />

      {children}
    </div>
  );
}
