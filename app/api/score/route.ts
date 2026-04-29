import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  const prompt = `Eres el analizador de sitios web de Boul Studio, agencia de diseño web especializada en conversión para LATAM. Analiza: ${url}

Evalúa estas 6 categorías (0-100):
1. conversion: CTAs, jerarquía visual, flujo
2. confianza: testimonios, contacto visible, credibilidad
3. diseno: estética, consistencia, tipografía
4. copy: claridad, beneficios, tono LATAM
5. velocidad: carga, imágenes, bloqueos
6. presencia: Google Maps, redes, reseñas

Responde SOLO con JSON válido sin markdown:
{"overall":número,"summary":"frase corta","categories":{"conversion":{"score":número,"summary":"frase"},"confianza":{"score":número,"summary":"frase"},"diseno":{"score":número,"summary":"frase"},"copy":{"score":número,"summary":"frase"},"velocidad":{"score":número,"summary":"frase"},"presencia":{"score":número,"summary":"frase"}},"issues":[{"severity":"alta|media|baja","category":"categoría","title":"título","desc":"recomendación"}]}`;

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
    console.log("Respuesta API:", JSON.stringify(data).substring(0, 400));

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
