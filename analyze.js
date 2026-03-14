// api/analyze.js — Studio23 Script Intelligence
// Modo: MOCK (sin API key). Devuelve desgloses simulados realistas.
// Para activar la API real, cambiar MOCK_MODE a false y configurar ANTHROPIC_API_KEY en Vercel.

const MOCK_MODE = true;

const MOCKS = {
  spot: [
    { nro_plano: 1, tipo_de_plano: "Plano General", descripcion_visual: "Amanecer sobre Buenos Aires. La ciudad despierta, luces encendiéndose en los edificios.", equipo_sugerido: "Dron", vibe: "Épico" },
    { nro_plano: 2, tipo_de_plano: "Plano Medio", descripcion_visual: "Protagonista camina hacia cámara con determinación. Ciudad de fondo desenfocada.", equipo_sugerido: "Steadicam", vibe: "Cinematográfico" },
    { nro_plano: 3, tipo_de_plano: "Plano Detalle", descripcion_visual: "Manos sosteniendo el producto. Textura y materialidad en primer plano.", equipo_sugerido: "Slider", vibe: "Editorial" },
    { nro_plano: 4, tipo_de_plano: "Primer Plano", descripcion_visual: "Rostro del protagonista. Mirada directa a cámara. Confianza.", equipo_sugerido: "Trípode", vibe: "Intimista" },
    { nro_plano: 5, tipo_de_plano: "Cenital", descripcion_visual: "Producto sobre superficie de mármol blanco. Composición geométrica perfecta.", equipo_sugerido: "Grúa", vibe: "Editorial" },
    { nro_plano: 6, tipo_de_plano: "Plano General", descripcion_visual: "Logo y tagline. Fade a blanco.", equipo_sugerido: "Trípode", vibe: "Cinematográfico" }
  ],
  videoclip: [
    { nro_plano: 1, tipo_de_plano: "Plano General", descripcion_visual: "Escenario vacío. El artista entra desde el fondo entre humo y luz contrastada.", equipo_sugerido: "Steadicam", vibe: "Dinámico" },
    { nro_plano: 2, tipo_de_plano: "Plano Americano", descripcion_visual: "Artista canta. Movimiento de cámara circular lento sincronizado con el beat.", equipo_sugerido: "Gimbal", vibe: "Cinematográfico" },
    { nro_plano: 3, tipo_de_plano: "Plano Detalle", descripcion_visual: "Dedos en las cuerdas de la guitarra. Detalle extremo, bokeh profundo.", equipo_sugerido: "Slider", vibe: "Intimista" },
    { nro_plano: 4, tipo_de_plano: "Contrapicado", descripcion_visual: "Artista desde abajo. Cielo nocturno de fondo, estrellas visibles.", equipo_sugerido: "Cámara en mano", vibe: "Épico" },
    { nro_plano: 5, tipo_de_plano: "Plano Secuencia", descripcion_visual: "Un solo take recorre todo el escenario mientras el coro explota.", equipo_sugerido: "Steadicam", vibe: "Dinámico" },
    { nro_plano: 6, tipo_de_plano: "Primer Plano", descripcion_visual: "Ojos cerrados del artista. Emoción pura. Corte seco al negro.", equipo_sugerido: "Trípode", vibe: "Contemplativo" }
  ],
  corto: [
    { nro_plano: 1, tipo_de_plano: "Plano General", descripcion_visual: "Exterior noche. Departamento viejo de Palermo. Una ventana iluminada entre todas las oscuras.", equipo_sugerido: "Trípode", vibe: "Tenso" },
    { nro_plano: 2, tipo_de_plano: "Plano Secuencia", descripcion_visual: "La cámara sigue a la protagonista desde la puerta hasta la cocina sin cortes.", equipo_sugerido: "Steadicam", vibe: "Verité" },
    { nro_plano: 3, tipo_de_plano: "Plano Detalle", descripcion_visual: "Taza de café humeante. El vapor se disuelve. Tiempo que pasa.", equipo_sugerido: "Trípode", vibe: "Contemplativo" },
    { nro_plano: 4, tipo_de_plano: "Plano Subjetivo", descripcion_visual: "Lo que ella ve: una carta sobre la mesa. Enfoque lento.", equipo_sugerido: "Cámara en mano", vibe: "Tenso" },
    { nro_plano: 5, tipo_de_plano: "Primer Plano", descripcion_visual: "Sus manos abren la carta. Temblor sutil.", equipo_sugerido: "Slider", vibe: "Intimista" },
    { nro_plano: 6, tipo_de_plano: "Picado", descripcion_visual: "La protagonista desde arriba, pequeña en el encuadre. La carta cae al piso.", equipo_sugerido: "Grúa", vibe: "Cinematográfico" },
    { nro_plano: 7, tipo_de_plano: "Plano General", descripcion_visual: "Exterior amanecer. La ventana ahora apagada entre todas las demás.", equipo_sugerido: "Trípode", vibe: "Contemplativo" }
  ]
};

function detectTipo(script) {
  const lower = script.toLowerCase();
  if (lower.includes("videoclip") || lower.includes("canción") || lower.includes("musica") || lower.includes("artista") || lower.includes("beat")) return "videoclip";
  if (lower.includes("escena") || lower.includes("personaje") || lower.includes("int.") || lower.includes("ext.") || lower.includes("protagonista")) return "corto";
  return "spot";
}

function generarMockDesdeTexto(script) {
  const tipo = detectTipo(script);
  return MOCKS[tipo];
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { script, preset } = req.body;

  if (!script || script.trim().length < 10) {
    return res.status(400).json({ error: "El guion es demasiado corto." });
  }

  // Simular latencia realista
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200));

  if (MOCK_MODE || !process.env.ANTHROPIC_API_KEY) {
    // Modo simulado
    const tipo = preset || detectTipo(script);
    const planos = MOCKS[tipo] || MOCKS.spot;
    return res.status(200).json({ planos, mock: true });
  }

  // Modo real (se activa cuando ANTHROPIC_API_KEY está configurada)
  try {
    const SYSTEM_PROMPT = `
Sos un asistente técnico de producción audiovisual para Studio23, una productora argentina de alto nivel.
Tu tarea: analizar guiones y devolver un desglose técnico de planos cinematográficos.

Respondé ÚNICAMENTE con un JSON array válido. Sin texto adicional. Sin markdown. Sin bloques de código.

Schema:
[{
  "nro_plano": number,
  "tipo_de_plano": enum(TIPOS),
  "descripcion_visual": string,
  "equipo_sugerido": enum(EQUIPOS),
  "vibe": enum(VIBES)
}]

TIPOS: Plano Detalle | Primer Plano | Plano Medio | Plano Americano | Plano General | Plano Secuencia | Plano Subjetivo | Cenital | Contrapicado | Picado
EQUIPOS: Trípode | Gimbal | Steadicam | Grúa | Dolly | Dron | Cámara en mano | Slider | Monopié
VIBES: Cinematográfico | Dinámico | Documental | Editorial | Intimista | Épico | Tenso | Contemplativo | Verité | Onírico

Cada escena o momento diferenciado = un plano. Sé preciso y técnico. Solo JSON.
    `;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: script }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    const planos = JSON.parse(text.replace(/```json|```/g, "").trim());

    return res.status(200).json({ planos, mock: false });
  } catch (err) {
    console.error("API Error:", err);
    // Fallback al mock si la API falla
    const tipo = detectTipo(script);
    const planos = MOCKS[tipo] || MOCKS.spot;
    return res.status(200).json({ planos, mock: true });
  }
}
