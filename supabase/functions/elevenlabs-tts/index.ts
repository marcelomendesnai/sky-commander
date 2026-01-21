import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Roger voice - professional male voice good for ATC
const DEFAULT_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17";

interface TTSRequest {
  text: string;
  voiceId?: string;
  apiKey: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, apiKey }: TTSRequest = await req.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Texto não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!apiKey || !apiKey.trim()) {
      return new Response(
        JSON.stringify({ error: "API Key ElevenLabs não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;

    console.log("Calling ElevenLabs TTS for text:", text.substring(0, 50) + "...");

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
            speed: 1.1, // Slightly faster for ATC style
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API Key ElevenLabs inválida" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 422) {
        return new Response(
          JSON.stringify({ error: "Texto muito longo ou voz inválida" }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro na API ElevenLabs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Return audio as base64 in JSON for easier handling
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in elevenlabs-tts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
