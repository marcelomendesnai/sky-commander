import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Allowed origins for CORS - restrict to known domains
const allowedOrigins = [
  'https://id-preview--d76a48f9-378e-4c35-9098-1135004c1717.lovable.app',
  'https://d76a48f9-378e-4c35-9098-1135004c1717.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : '',
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function validateOrigin(req: Request): boolean {
  const origin = req.headers.get('origin') || '';
  // Allow requests without origin (same-origin, mobile apps, etc.)
  if (!origin) return true;
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  );
}

// Roger voice - professional male voice good for ATC
const DEFAULT_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17";

// Input validation limits
const MAX_TEXT_LENGTH = 5000;
const MAX_VOICE_ID_LENGTH = 50;
const MAX_API_KEY_LENGTH = 100;

interface TTSRequest {
  text: string;
  voiceId?: string;
  apiKey: string;
}

/**
 * Validates and sanitizes TTS request input
 */
function validateInput(body: unknown): { valid: true; data: TTSRequest } | { valid: false; error: string; status: number } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Requisição inválida", status: 400 };
  }

  const { text, voiceId, apiKey } = body as Record<string, unknown>;

  // Validate text
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { valid: false, error: "Texto não fornecido", status: 400 };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Texto muito longo (máximo ${MAX_TEXT_LENGTH} caracteres)`, status: 400 };
  }

  // Validate apiKey
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return { valid: false, error: "API Key não fornecida", status: 400 };
  }
  if (apiKey.length > MAX_API_KEY_LENGTH) {
    return { valid: false, error: "API Key inválida", status: 400 };
  }

  // Validate voiceId (optional)
  if (voiceId !== undefined && voiceId !== null) {
    if (typeof voiceId !== 'string' || voiceId.length > MAX_VOICE_ID_LENGTH) {
      return { valid: false, error: "Voice ID inválido", status: 400 };
    }
  }

  return {
    valid: true,
    data: {
      text: text.trim(),
      voiceId: typeof voiceId === 'string' ? voiceId.trim() : undefined,
      apiKey: apiKey.trim(),
    },
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin for non-OPTIONS requests
  if (!validateOrigin(req)) {
    console.warn("Blocked request from unauthorized origin:", req.headers.get('origin'));
    return new Response(
      JSON.stringify({ error: "Origem não autorizada" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Requisição inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: validation.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId, apiKey } = validation.data;
    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;

    // Log only a snippet for debugging (no sensitive data)
    console.log("Processing TTS request, text length:", text.length);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.1,
          },
        }),
      }
    );

    if (!response.ok) {
      // Log detailed error server-side only
      const errorText = await response.text();
      console.error("External API error:", response.status, errorText);

      // Return generic errors to client (no internal details exposed)
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Falha na autenticação" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 422) {
        return new Response(
          JSON.stringify({ error: "Parâmetros inválidos" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro no serviço de áudio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error("Function error:", error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
