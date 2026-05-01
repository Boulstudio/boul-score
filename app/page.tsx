"use client";
import { useState } from "react";

const CATEGORIES = [
  { key: "conversion", label: "Conversión" },
  { key: "confianza", label: "Confianza" },
  { key: "diseno", label: "Diseño visual" },
  { key: "copy", label: "Copy" },
  { key: "velocidad", label: "Velocidad" },
  { key: "presencia", label: "Presencia digital" },
];

function scoreColor(s: number) {
  if (s >= 70) return "#22c55e";
  if (s >= 45) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(s: number) {
  if (s >= 80) return "Excelente";
  if (s >= 65) return "Bueno";
  if (s >= 45) return "Mejorable";
  if (s >= 25) return "Problemas serios";
  return "Crítico";
}

function Dial({ score }: { score: number }) {
  const r = 40, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 26, color }}>
        {score}
      </div>
    </div>
  );
}

interface Result {
  overall: number;
  summary: string;
  categories: Record<string, { score: number; summary: string }>;
  issues: Array<{ severity: string; category: string; title: string; desc: string }>;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function analyze() {
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError("Error al analizar el sitio. Intenta de nuevo.");
    }
    setLoading(false);
  }

  const sevColor: Record<string, string> = { alta: "#ef4444", media: "#f59e0b", baja: "#22c55e" };

  return (
    <main style={{
      fontFamily: "Epilogue, sans-serif",
      background: "#0F1115",
      minHeight: "100vh",
      color: "#ffffff",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Epilogue:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "4rem 1.5rem 3rem" }}>

        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
            background: "#1e1e1e", border: "1px solid #2a2a2a",
            borderRadius: 100, padding: "4px 14px", marginBottom: "1.5rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
              Boul Score
            </span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 40,
            lineHeight: 1.15, margin: "0 0 1rem", letterSpacing: "-1px" }}>
            ¿Tu web está perdiendo clientes?
          </h1>
          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6, margin: 0 }}>
            Pega tu URL y en segundos sabes exactamente qué está fallando — y qué arreglar primero.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
          <input
            type="url"
            placeholder="https://tusitioweb.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            style={{
              flex: 1, fontFamily: "Epilogue, sans-serif", fontSize: 14,
              padding: "0 16px", height: 48,
              background: "#1e1e1e", border: "1px solid #2a2a2a",
              borderRadius: 8, outline: "none", color: "#fff",
            }}
          />
          <button onClick={analyze} disabled={loading || !url}
            style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
              padding: "0 24px", height: 48,
              background: loading || !url ? "#2a2a2a" : "#7C3AED",
              color: loading || !url ? "#555" : "#fff",
              transition: "background 0.2s",
              border: "none", borderRadius: 100,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}>
            {loading ? "Analizando…" : "Analizar"}
          </button>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: "1rem" }}>{error}</p>}

        {loading && (
          <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#555" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: "#7C3AED", marginRight: 8 }} />
              Analizando tu sitio web…
            </div>
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "1.75rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem",
                paddingBottom: "1.5rem", borderBottom: "1px solid #222" }}>
                <Dial score={Math.round(result.overall)} />
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 22,
                    color: scoreColor(result.overall), marginBottom: 6, letterSpacing: "-0.5px" }}>
                    {scoreLabel(result.overall)}
                  </div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{result.summary}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: "2rem" }}>
                {CATEGORIES.map(c => {
                  const cat = result.categories[c.key] || {};
                  const s = Math.round(cat.score || 0);
                  const col = scoreColor(s);
                  return (
                    <div key={c.key} style={{ background: "#0F1115", border: "1px solid #222", borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, fontWeight: 500, color: "#555", textTransform: "uppercase",
                        letterSpacing: "0.8px", marginBottom: 8 }}>{c.label}</div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 22, color: col, marginBottom: 6 }}>
                        {s}<span style={{ fontSize: 11, fontWeight: 400, color: "#444" }}>/100</span>
                      </div>
                      <div style={{ height: 2, borderRadius: 2, background: "#222" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: col, width: `${s}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Problemas prioritarios
              </div>
              {result.issues.map((issue, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid #1e1e1e" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: sevColor[issue.severity] || "#555" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 4 }}>
                      {issue.title}{" "}
                      <span style={{ fontSize: 11, color: "#444", fontWeight: 400 }}>({issue.category})</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{issue.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .btn-analizar { background: #7C3AED !important; }
        .btn-analizar:hover { background: #5F2BB8 !important; }
        .btn-analizar:disabled { background: #2a2a2a !important; }
        input::placeholder { color: #444; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </main>
  );
}
