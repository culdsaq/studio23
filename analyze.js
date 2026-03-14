const SYSTEM_PROMPT = `Sos un asistente técnico de producción audiovisual para Studio23, una productora argentina de alto nivel.
Tu tarea: analizar guiones y devolver un desglose técnico de planos cinematográficos.

Respondé ÚNICAMENTE con un JSON array válido. Sin texto adicional. Sin markdown. Sin bloques de código.

Schema por objeto:
{
  "nro_plano": number,
  "tipo_de_plano": string (del vocabulario TIPOS),
  "descripcion_visual": string (descripción técnica del encuadre y acción visual),
  "equipo_sugerido": string (del vocabulario EQUIPOS),
  "vibe": string (del vocabulario VIBES)
}

TIPOS válidos: Plano Detalle, Primer Plano, Plano Medio, Plano Americano, Plano General, Plano Secuencia, Plano Subjetivo, Plano Cenital, Plano Contrapicado, Plano Picado

EQUIPOS válidos: Trípode, Gimbal, Steadicam, Grúa, Dolly, Dron, Cámara en mano, Slider, Monopié

VIBES válidos: Cinematográfico, Dinámico, Documental, Editorial, Intimista, Épico, Tenso, Contemplativo, Verité, Onírico

Instrucciones: Cada escena o momento diferenciado = un plano separado. Sé preciso y técnico. Solo JSON.`;

export default async function handler(req, res) {
  // CORS headers — permite llamadas desde el mismo dominio Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { guion } = req.body;
  if (!guion || typeof guion !== 'string' || guion.trim().length < 10) {
    return res.status(400).json({ error: 'Guion inválido o demasiado corto.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key no configurada en el servidor.' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: `Guion para desgranar:\n\n${guion.trim()}` }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}));
      return res.status(anthropicRes.status).json({
        error: err.error?.message || `Anthropic API error ${anthropicRes.status}`,
      });
    }

    const data  = await anthropicRes.json();
    const raw   = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = raw.replace(/```json|```/gi, '').trim();

    let planos;
    try {
      planos = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: 'El modelo no devolvió JSON válido.', raw: clean });
    }

    if (!Array.isArray(planos) || planos.length === 0) {
      return res.status(502).json({ error: 'El modelo devolvió un array vacío.', raw: clean });
    }

    return res.status(200).json({ planos, raw: clean });

  } catch (err) {
    console.error('[analyze] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor.' });
  }
}
