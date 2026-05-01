import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  const prompt = [
    "Eres el analizador de Boul Studio, agencia de diseno web para LATAM. Criterio muy estricto y profesional.",
    "",
    "Analiza este sitio web: " + url,
    "",
    "Evalua estas 6 categorias con puntaje 0-100:",
    "- conversion: CTAs visibles, jerarquia clara, flujo hacia accion. Penaliza si no hay CTA en hero.",
    "- confianza: Testimonios con foto y nombre, contacto visible, credibilidad.",
    "- diseno: MUY ESTRICTO. 0-20 amateur, 21-40 basico pymes LATAM, 41-60 aceptable, 61-75 bueno, 76-90 nivel agencia, 91-100 excepcional. Penaliza tipografia inconsistente, colores sin coherencia, imagenes de stock, falta de whitespace.",
    "- copy: Claridad en 5 segundos, beneficios concretos vs features.",
    "- velocidad: Imagenes pesadas, sliders, videos autoplay.",
    "- presencia: Google Maps, redes activas, resenas Google.",
    "",
    "Responde UNICAMENTE con un objeto JSON valido. Sin texto antes ni despues. Sin markdown. Sin backticks.",
    "El JSON debe tener esta estructura exacta:",
    '{',
    '  "overall": 45,',
    '  "summary": "frase corta del estado general",',
    '  "categories": {',
    '    "conversion": { "score": 40, "summary": "una frase" },',
    '    "confianza": { "score": 50, "summary": "una frase" },',
    '    "diseno": { "score": 30, "summary": "una frase" },',
    '    "copy": { "score": 45, "summary": "una frase" },',
    '    "velocidad": { "score": 60, "summary": "una frase" },',
    '    "presencia": { "score": 35, "summary": "una frase" }',
    '  },',
    '  "issues": [',
    '    { "severity": "alta", "category": "conversion", "title": "titulo del problema", "desc": "recomendacion concreta" }',
    '  ]',
    '}',
    "",
    "Reemplaza los numeros de ejemplo con los scores reales del sitio analizado.",
    "Genera entre 4 y 6 issues ordenados de mayor a menor impacto."
  ].join("\n");

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    if (!textBlock) return NextResponse.json({ error: "Sin texto", raw: data }, { status: 500 });

    const raw = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
