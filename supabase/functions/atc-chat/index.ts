import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
  flightData: {
    aircraft: string;
    departureIcao: string;
    arrivalIcao: string;
    flightType: string;
    mode: string;
  };
  metarContext: string;
  talkingTo: 'atc' | 'evaluator';
  systemPrompt: string;
  anthropicApiKey?: string;
  selectedModel?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      message,
      history,
      flightData,
      metarContext,
      talkingTo,
      systemPrompt,
      anthropicApiKey,
      selectedModel,
    }: ChatRequest = await req.json();

    // Build the full system prompt with flight context
    const fullSystemPrompt = `${systemPrompt}

## CONTEXTO DO VOO ATUAL

**Aeronave:** ${flightData.aircraft}
**Saída:** ${flightData.departureIcao}
**Chegada:** ${flightData.arrivalIcao}
**Tipo de Voo:** ${flightData.flightType}
**Modo:** ${flightData.mode}

**Dados Meteorológicos:**
${metarContext || 'Não disponível'}

## INSTRUÇÃO DE RESPOSTA

${talkingTo === 'atc' ? `
Você está respondendo como ATC. O piloto está falando com você pelo rádio.
${flightData.mode === 'TREINO' ? `
IMPORTANTE: Após sua resposta como ATC, adicione uma avaliação como instrutor.
Formate assim:
📡 ATC: [sua resposta como controlador]

🧠 Avaliador: [sua análise técnica da comunicação do piloto]
` : `
Responda APENAS como ATC, sem avaliação.
Formate assim:
📡 ATC: [sua resposta como controlador]
`}` : `
O piloto está falando diretamente com você, o Avaliador/Instrutor, em uma conversa privada.
O ATC NÃO está ouvindo esta conversa.
Responda como instrutor, dando orientações, explicações e tirando dúvidas.
Formate assim:
🧠 Avaliador: [sua resposta como instrutor]
`}`;

    // Build messages array
    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...history.map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    let response: Response;

    // Check if user provided Anthropic API key
    if (anthropicApiKey && anthropicApiKey.trim()) {
      // Use Anthropic Claude API
      console.log("Using Anthropic Claude API");
      
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: fullSystemPrompt,
          messages: messages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, errorText);
        
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: "API Key Anthropic inválida" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Erro na API Anthropic" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const anthropicData = await response.json();
      const content = anthropicData.content?.[0]?.text || "";

      // Parse the response to separate ATC and Evaluator
      const result = parseATCResponse(content, talkingTo);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      // Use Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const model = selectedModel || "google/gemini-3-flash-preview";
      console.log("Using Lovable AI Gateway with model:", model);

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lovable AI Gateway error:", response.status, errorText);

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "Erro no gateway de IA" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Parse the response to separate ATC and Evaluator
      const result = parseATCResponse(content, talkingTo);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error in atc-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseATCResponse(
  content: string,
  talkingTo: 'atc' | 'evaluator'
): { atcResponse?: string; evaluatorResponse?: string; isWaiting?: boolean } {
  const result: { atcResponse?: string; evaluatorResponse?: string; isWaiting?: boolean } = {};

  // Check for waiting scenarios
  const waitingPatterns = [
    /hold (position|short)/i,
    /traffic (on final|on approach|in sight)/i,
    /stand by/i,
    /expect (delay|holding)/i,
    /sequence/i,
    /behind/i,
    /number \d+ (to|for)/i,
  ];
  
  result.isWaiting = waitingPatterns.some(pattern => pattern.test(content));

  if (talkingTo === 'evaluator') {
    // When talking to evaluator, everything is evaluator response
    // Remove the prefix if present
    const cleanContent = content.replace(/^🧠\s*Avaliador:\s*/i, '').trim();
    result.evaluatorResponse = cleanContent;
  } else {
    // Parse ATC and Evaluator responses
    const atcMatch = content.match(/📡\s*ATC:\s*([\s\S]*?)(?=🧠\s*Avaliador:|$)/i);
    const evaluatorMatch = content.match(/🧠\s*Avaliador:\s*([\s\S]*?)$/i);

    if (atcMatch) {
      result.atcResponse = atcMatch[1].trim();
    } else if (!content.includes('🧠')) {
      // If no prefix found and no evaluator, assume it's all ATC
      result.atcResponse = content.trim();
    }

    if (evaluatorMatch) {
      result.evaluatorResponse = evaluatorMatch[1].trim();
    }
  }

  return result;
}
