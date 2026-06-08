"use client";

import { useEffect, useState } from "react";

export default function CreateAnimation({ onComplete }: { onComplete: () => void }) {
  const [go, setGo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setGo(true), 40);
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(onComplete, 2550);
    return () => [t0, t1, t2].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes bt-rise {
          0%   { transform: translateY(0px)   scaleX(1)    scaleY(1);    opacity: 1; }
          30%  { transform: translateY(-140px) scaleX(1)    scaleY(1);    opacity: 1; }
          38%  { transform: translateY(-155px) scaleX(1.2)  scaleY(0.82); opacity: 1; }
          46%  { transform: translateY(-140px) scaleX(0.95) scaleY(1.05); }
          72%  { transform: translateY(62px)  scaleX(0.72) scaleY(1.4);  opacity: 1; }
          80%  { transform: translateY(78px)  scaleX(1.6)  scaleY(0.5);  opacity: 1; }
          88%  { transform: translateY(70px)  scaleX(0.9)  scaleY(1.1);  opacity: 0.55; }
          100% { transform: translateY(74px)  scaleX(1)    scaleY(1);    opacity: 0; }
        }

        @keyframes bt-box-in {
          0%   { opacity: 0; clip-path: inset(100% 0 0 0); }
          100% { opacity: 1; clip-path: inset(0% 0 0 0); }
        }

        @keyframes bt-lid-open {
          0%   { transform: rotateX(0deg);   opacity: 1; }
          45%  { transform: rotateX(-90deg); opacity: 1; }
          100% { transform: rotateX(0deg);   opacity: 1; }
        }

        @keyframes bt-ripple {
          0%   { transform: scale(0.1); opacity: 0.75; }
          100% { transform: scale(1.1); opacity: 0; }
        }

        @keyframes bt-text {
          0%   { opacity: 0; transform: translateY(6px); letter-spacing: 0.25em; }
          100% { opacity: 1; transform: translateY(0);   letter-spacing: 0.12em; }
        }

        @keyframes bt-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(255,224,51,0.7); }
          50%       { box-shadow: 0 0 24px 6px rgba(255,224,51,1), 0 0 48px 12px rgba(255,224,51,0.25); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut ? 0 : 1,
          transition: fadeOut ? "opacity 0.35s ease" : "none",
        }}
      >
        {go && (
          <div style={{ position: "relative", width: 120, height: 280, display: "flex", justifyContent: "center" }}>

            {/* Dot */}
            <div
              style={{
                position: "absolute",
                top: 96,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#ffe033",
                animation: "bt-rise 1.65s cubic-bezier(0.4,0,0.6,1) 0.1s forwards, bt-glow-pulse 0.7s ease-in-out infinite",
              }}
            />

            {/* Box (3 sides — no top) */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                width: 68,
                height: 58,
                animation: "bt-box-in 0.22s ease 1.0s forwards",
                opacity: 0,
              }}
            >
              <div style={{ position: "absolute", left: 0,  top: 0, bottom: 0, width: "1.5px", background: "rgba(255,224,51,0.65)", borderRadius: 2 }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "1.5px", background: "rgba(255,224,51,0.65)", borderRadius: 2 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1.5px", background: "rgba(255,224,51,0.65)", borderRadius: 2 }} />

              {/* Ripple inside */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  marginLeft: -16,
                  width: 32,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(255,224,51,0.5)",
                  animation: "bt-ripple 0.45s ease-out 1.55s forwards",
                  opacity: 0,
                }}
              />
            </div>

            {/* Lid (top bar that swings open then closed) */}
            <div
              style={{
                position: "absolute",
                bottom: 88,
                width: 71,
                height: "1.5px",
                background: "rgba(255,224,51,0.65)",
                transformOrigin: "center bottom",
                perspective: 200,
                animation: "bt-lid-open 0.5s ease 0.92s both",
                opacity: 0,
                borderRadius: 2,
              }}
            />

            {/* Text */}
            <div
              style={{
                position: "absolute",
                bottom: 2,
                whiteSpace: "nowrap",
                animation: "bt-text 0.5s ease 1.75s forwards",
                opacity: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Biteti Tecnologia
              </span>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
