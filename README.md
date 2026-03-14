# Script Intelligence — Studio23 × AI

Demo técnico de automatización de desglose de guiones con Claude API.

## Estructura

```
/
├── index.html        ← landing + demo interactivo
├── vercel.json       ← config de routing
├── README.md
└── api/
    └── analyze.js    ← serverless proxy (Vercel Function)
```

## Deploy en Vercel

### 1. Subir el proyecto

```bash
# Opción A — Vercel CLI
npm i -g vercel
vercel

# Opción B — drag & drop en vercel.com/new
# Arrastrá la carpeta del proyecto
```

### 2. Configurar la API key

En el dashboard de Vercel:
**Settings → Environment Variables → Add**

```
Name:   ANTHROPIC_API_KEY
Value:  sk-ant-...
```

Redeploy después de agregar la variable.

### 3. Listo

La función `/api/analyze` actúa de proxy entre el front y Anthropic.
La API key nunca se expone en el cliente.

---

## Cómo funciona

```
Usuario escribe guion
        ↓
  POST /api/analyze
        ↓
  Vercel Function (api/analyze.js)
        ↓
  POST api.anthropic.com/v1/messages
  (con ANTHROPIC_API_KEY del servidor)
        ↓
  JSON con array de planos
        ↓
  Tabla renderizada en el front
```
