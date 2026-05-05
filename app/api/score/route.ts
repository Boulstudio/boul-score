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
    "- conversion: CTAs visibles con contraste, jerarquia clara, flujo hacia accion. Un boton tipo Agenda / Cotiza / Contacta en el hero cuenta como CTA valido aunque no use lenguaje de urgencia. Penaliza solo si no hay ningun CTA visible o si el flujo hacia contacto es confuso.",
    "- confianza: Evalua prueba social y credibilidad. ESCALA: 80-90 si hay testimonios con foto y nombre visible (aunque falte logo de empresa), casos de estudio con resultados, o clientes reconocibles listados. 60-79 si hay prueba social parcial (logos sin nombres, o menciones sin detalle). 40-59 si hay muy poca prueba social. 20-39 si no hay ninguna. IMPORTANTE: si el sitio tiene una seccion dedicada de testimonios con personas reales identificables, dale minimo 80. No penalices la ausencia de logos corporativos si hay nombres y fotos reales.",
    "- diseno: CRITERIO ESTRICTO PERO JUSTO. 0-20 amateur, 21-40 basico pymes LATAM, 41-60 aceptable con inconsistencias, 61-75 bueno con sistema visual coherente, 76-90 nivel agencia internacional, 91-100 excepcional. Un sitio con sistema tipografico consistente, paleta coherente, buen uso de whitespace, jerarquia visual clara y estetica profesional moderna deberia estar entre 65-75. Penaliza tipografia mezclada, colores sin coherencia, imagenes de stock genericas, layouts desbalanceados.",
    "- copy: Claridad del mensaje en 5 segundos, beneficios concretos vs features, tono adecuado para el mercado, headline memorable. IMPORTANTE: valora el copy estrategico que comunica propuesta de valor clara, usa lenguaje orientado a resultados y conecta emocionalmente con el cliente. Un sitio de agencia con copy bien trabajado, sin relleno corporativo y con mensajes directos deberia estar entre 65-80.",
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
