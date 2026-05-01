import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  const prompt = "Eres el analizador de Boul Studio, agencia de diseno web para LATAM. Criterio muy estricto.\n\nAnaliza: " + url + "\n\nCRITERIOS:\n1. conversion: CTAs visibles, jerarquia clara, flujo hacia accion.\n2. confianza: Testimonios con foto y nombre, contacto visible.\n3. diseno: CRITERIO MUY ESTRICTO. Escala: 0-20 amateur, 21-40 basico pymes LATAM, 41-60 aceptable, 61-75 bueno, 76-90 nivel agencia, 91-100 excepcional. Penaliza tipografia inconsistente, colores sin coherencia, imagenes de stock, falta de whitespace, layouts desbalanceados.\n4. copy: Claridad en 5 segundos, beneficios vs features.\n5. velocidad: Imagenes pesadas, sliders, videos autoplay.\n6. presencia: Google Maps, redes activas, resenas Google.\n\nResponde SOLO con JSON valido sin markdown ni texto extra: {\"overall\":0,\"summary\":\"frase\",\"categories\":{\"conversion\":{\"score\":0,\"summary\":\"frase\"},\"confianza\":{\"score\":0,\"summary\":\"frase\"},\"diseno\":{\"score\":0,\"summary\":\"frase\"},\"copy\":{\"score\":0,\"summary\":\"frase\"},\"velocidad\":{\"score\":0,\"summary\":\"frase\"},\"presencia\":{\"score\":0,\"summary\":\"frase\"}},\"issues\":[{\"severity\":\"alta\",\"category\":\"cat\",\"title\":\"titulo\",\"desc\":\"desc\"}]}\n\nGenera 4-6 issues reales de mayor a menor impacto. Reemplaza todos los 0 con scores reales.";

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
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
