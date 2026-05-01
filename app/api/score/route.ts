import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  const prompt = `Eres el analizador de sitios web de Boul Studio, una agencia de diseño web de alto estándar especializada en conversión para LATAM. Tu criterio es estricto y profesional, similar al de un diseñador senior con experiencia en agencias internacionales.

Analiza: ${url}

CRITERIOS (sé muy exigente, la mayoría de sitios LATAM tienen problemas serios):

1. conversion: CTAs visibles con contraste, jerarquía clara, flujo hacia acción. Penaliza si no hay CTA en el hero.
2. confianza: Testimonios con foto y nombre, casos de éxito con resultados, contacto visible.
3. diseno: CRITERIO MUY ESTRICTO. Penaliza: tipografía inconsistente, paleta sin coherencia, imágenes de stock genéricas, layouts desbalanceados, falta de whitespace, mezcla de estilos. Escala: 0-20 amateur, 21-40 básico (mayoría pymes LATAM), 41-60 aceptable con inconsistencias, 61-75 bueno, 76-90 nivel agencia, 91-100 excepcional.
4. copy: Claridad en 5 segundos, beneficios concretos, tono para el mercado.
5. velocidad: Imágenes sin optimizar, sliders pesados, videos autoplay.
6. presencia: Google Maps, redes activas, reseñas visibles.

Responde SOLO con JSON sin markdown: {"overall":número,"summary":"frase corta","categories":{"conversion":{"score":número,"summary":"frase"},"confianza":{"score":número,"summary":"frase"},"diseno":{"score":número,"summary":"frase"},"copy":{"score":número,"summary":"frase"},"velocidad":{"score":número,"summary":"frase"},"presencia":{"score":número,"summary":"frase"}},"issues":[{"severity":"alta|media|baja","category":"categoría","title":"título","desc":"recomendación"}]}

Genera 4-6 issues de mayor a menor impacto.`;

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
        max_tokens: 1000,
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