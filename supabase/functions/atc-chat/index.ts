import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SelectedFrequency {
  airport: 'departure' | 'arrival';
  frequencyType: string;
  frequency: string;
  name: string;
}

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
  selectedFrequency?: SelectedFrequency | null;
}

// Função para gerar ATIS no formato padrão de transmissão de rádio
function generateAtisMessage(
  flightData: ChatRequest['flightData'],
  metarContext: string,
  selectedFrequency: SelectedFrequency
): string {
  // Alfabeto fonético NATO
  const letters = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 
                   'HOTEL', 'INDIA', 'JULIET', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER',
                   'OSCAR', 'PAPA', 'QUEBEC', 'ROMEO', 'SIERRA', 'TANGO', 'UNIFORM',
                   'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'];
  const infoLetter = letters[Math.floor(Math.random() * letters.length)];
  
  // Determinar ICAO e nome do aeroporto
  const airportIcao = selectedFrequency.airport === 'departure' 
    ? flightData.departureIcao 
    : flightData.arrivalIcao;
  
  // Extrair nome do aeroporto da frequência
  const airportName = selectedFrequency.name
    .replace(/^ATIS\s*/i, '')
    .trim() || airportIcao;
  
  // Hora atual Zulu
  const now = new Date();
  const zuluHour = String(now.getUTCHours()).padStart(2, '0');
  const zuluMin = String(now.getUTCMinutes()).padStart(2, '0');
  const zuluTime = `${zuluHour}${zuluMin}`;
  
  // Parser do METAR para extrair dados
  let wind = 'Vento calmo';
  let visibility = 'Visibilidade maior que 10 quilômetros';
  let ceiling = 'Céu claro';
  let tempDewpoint = '';
  let qnh = '';
  let runway = '';
  let conditions = '';
  
  // Parse wind from METAR context
  const windMatch = metarContext.match(/Vento:\s*(\d+)[°º]?\s*(?:graus?)?\s*[,/]?\s*(\d+)\s*(?:nós|kt)/i);
  const windCalmMatch = metarContext.match(/Vento:\s*(calmo|calm|vrb)/i);
  if (windMatch) {
    const windDir = parseInt(windMatch[1]);
    const windSpeed = parseInt(windMatch[2]);
    wind = `Vento ${String(windDir).padStart(3, '0')} graus, ${windSpeed} nós`;
    
    // Calcular pista provável baseada no vento (arredonda para a dezena mais próxima)
    const runwayNum = Math.round(windDir / 10);
    runway = `Pista em uso ${String(runwayNum === 0 ? 36 : runwayNum).padStart(2, '0')}`;
  } else if (windCalmMatch) {
    wind = 'Vento calmo';
    runway = 'Consulte a torre para pista em uso';
  }
  
  // Parse visibility
  const visMatch = metarContext.match(/Visibilidade:\s*(\d+)\s*(metros?|m|km|quilômetros?)/i);
  const cavokMatch = metarContext.match(/CAVOK/i);
  if (cavokMatch) {
    visibility = 'CAVOK';
    ceiling = '';
  } else if (visMatch) {
    const visValue = parseInt(visMatch[1]);
    const visUnit = visMatch[2].toLowerCase();
    if (visUnit.startsWith('k') || visUnit.startsWith('q')) {
      visibility = `Visibilidade ${visValue} quilômetros`;
    } else {
      visibility = visValue >= 9999 
        ? 'Visibilidade maior que 10 quilômetros'
        : `Visibilidade ${visValue} metros`;
    }
  }
  
  // Parse ceiling/clouds
  const cloudPatterns = metarContext.match(/(Nuvens?|Teto|Ceiling|Clouds?):\s*([^\n]+)/i);
  if (cloudPatterns && !cavokMatch) {
    const cloudInfo = cloudPatterns[2].trim();
    if (cloudInfo.toLowerCase().includes('clr') || cloudInfo.toLowerCase().includes('skc') || cloudInfo.toLowerCase().includes('céu claro')) {
      ceiling = 'Céu claro';
    } else {
      ceiling = `Nuvens: ${cloudInfo}`;
    }
  }
  
  // Parse temperature and dewpoint
  const tempMatch = metarContext.match(/Temperatura:\s*(-?\d+)[°º]?C?/i);
  const dewMatch = metarContext.match(/(?:Ponto de orvalho|Dewpoint):\s*(-?\d+)[°º]?C?/i);
  if (tempMatch) {
    const temp = tempMatch[1];
    const dew = dewMatch ? dewMatch[1] : null;
    tempDewpoint = dew 
      ? `Temperatura ${temp}, ponto de orvalho ${dew}`
      : `Temperatura ${temp} graus`;
  }
  
  // Parse QNH
  const qnhMatch = metarContext.match(/(?:QNH|Altímetro):\s*(\d{4})\s*(hPa|hectopascals?)?/i);
  const altMatch = metarContext.match(/(?:Altimeter|QNH):\s*(\d{2})\.?(\d{2})/i);
  if (qnhMatch) {
    qnh = `QNH ${qnhMatch[1]} hectopascals`;
  } else if (altMatch) {
    // Convert inHg to hPa if needed
    const inhg = parseFloat(`${altMatch[1]}.${altMatch[2]}`);
    const hpa = Math.round(inhg * 33.8639);
    qnh = `QNH ${hpa} hectopascals`;
  }
  
  // Parse weather conditions (rain, fog, etc)
  const wxPatterns = [
    { pattern: /chuva\s*(forte|fraca|moderada)?/i, text: 'Chuva' },
    { pattern: /(rain|ra)\s*(heavy|light)?/i, text: 'Chuva' },
    { pattern: /névoa|mist|br/i, text: 'Névoa' },
    { pattern: /nevoeiro|fog|fg/i, text: 'Nevoeiro' },
    { pattern: /trovoada|thunder|ts/i, text: 'Trovoada' },
  ];
  const wxConditions: string[] = [];
  for (const wx of wxPatterns) {
    if (wx.pattern.test(metarContext)) {
      wxConditions.push(wx.text.toLowerCase());
    }
  }
  if (wxConditions.length > 0) {
    conditions = wxConditions.join(' e ');
  }
  
  // Montar mensagem ATIS
  const atisLines = [
    `${airportName} informação ${infoLetter}, hora ${zuluTime} Zulu.`,
    runway ? `${runway}.` : null,
    `${wind}.`,
    visibility !== 'CAVOK' ? `${visibility}${conditions ? `, ${conditions}` : ''}.` : 'CAVOK.',
    ceiling && visibility !== 'CAVOK' ? `${ceiling}.` : null,
    tempDewpoint ? `${tempDewpoint}.` : null,
    qnh ? `${qnh}.` : null,
    `Ao contato inicial, informe ter ${infoLetter}.`,
  ].filter(Boolean);
  
  return `📡 ATIS ${airportIcao}:

"${atisLines.join('\n')}"`;
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
      selectedFrequency,
    }: ChatRequest = await req.json();

    // ATIS: Gerar resposta automática formatada (não precisa de IA)
    if (selectedFrequency?.frequencyType === 'ATIS') {
      const atisResponse = generateAtisMessage(flightData, metarContext, selectedFrequency);
      return new Response(JSON.stringify({ 
        atcResponse: atisResponse, 
        isWaiting: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build frequency context for prompt
    let frequencyContext = '';
    if (selectedFrequency) {
      const airportIcao = selectedFrequency.airport === 'departure' 
        ? flightData.departureIcao 
        : flightData.arrivalIcao;
      
      // Extract airport name from frequency name (e.g., "Solo Guarulhos" → "Guarulhos")
      const airportName = selectedFrequency.name.replace(/^(ATIS|Solo|Torre|Aproximação|Decolagem|Controle|APP|GND|TWR|DEP|CLR|CTR)\s*/i, '').trim();
      
      frequencyContext = `
**Frequência Sintonizada pelo Piloto:**
Aeroporto: ${airportIcao} (${airportName}) - ${selectedFrequency.airport === 'departure' ? 'SAÍDA' : 'DESTINO'}
Setor: ${selectedFrequency.frequencyType} (${selectedFrequency.frequency})
Nome Completo: ${selectedFrequency.name}

VALIDAÇÃO CRÍTICA - VOCÊ DEVE VERIFICAR DUAS COISAS:

1. **AEROPORTO CORRETO**: O piloto DEVE chamar o aeroporto onde está sintonizado (${airportName}/${airportIcao}).
   - Se ele chamar OUTRO aeroporto (ex: chamar "Recife" quando está em "Guarulhos"), você deve responder:
   "Estação chamando [aeroporto errado], você está na frequência de ${airportName}, verifique sua frequência."
   
2. **SETOR CORRETO**: O piloto DEVE chamar o setor sintonizado (${selectedFrequency.frequencyType}).
   - Se ele chamar outro setor (ex: chamar "Torre" quando está em "Solo"), você deve responder:
   "Estação chamando [setor errado], você está na frequência ${selectedFrequency.frequencyType === 'GND' ? 'do Solo' : selectedFrequency.frequencyType === 'TWR' ? 'da Torre' : 'de ' + selectedFrequency.frequencyType}, verifique sua frequência."

EXEMPLOS DE ERROS:
- Sintonizado: SBGR SOLO | Piloto diz: "Recife Solo" → ERRO! Aeroporto errado.
- Sintonizado: SBGR SOLO | Piloto diz: "Guarulhos Torre" → ERRO! Setor errado.
- Sintonizado: SBGR SOLO | Piloto diz: "Guarulhos Solo" → CORRETO!`;
    }

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
${frequencyContext}

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

  // Check for waiting scenarios - Portuguese AND English patterns
  // IMPORTANTE: Padrões devem ser específicos para INSTRUÇÕES DE ESPERA reais,
  // não apenas menções casuais das palavras
  const waitingPatterns = [
    // English patterns - instruções específicas
    /hold (position|short)/i,
    /hold at/i,
    /traffic (on final|on approach|landing)/i,
    /stand by/i,
    /expect (delay|holding|further)/i,
    /behind (the |a )?\w+/i,
    /number \d+ (to land|for|in sequence)/i,
    
    // Portuguese patterns - instruções específicas
    /mantenha posição/i,
    /mantenha curta/i,
    /aguarde (na|em|o |a |autorização)/i,
    /espere (na|em|o |a )/i,
    /pista em uso/i,
    /sequência para/i,
    /número \d+ para/i,
    /após (o |a )?(tráfego|pouso|decolagem|aeronave)/i,
    /autorização pendente/i,
    /aguardando (slot|autorização|liberação)/i,
    /livre para (esperar|manter)/i,
    /reporte pronto/i,
  ];

  // Excluir falsos positivos comuns
  const falsePositivePatterns = [
    /Tráfego [A-Z]{4}/i,           // "Tráfego Guarulhos" (callsign)
    /informo tráfego/i,            // Informação de tráfego, não instrução
    /tráfego (visual|à vista)/i,   // Reporte de tráfego avistado
    /bom dia|boa tarde|boa noite/i, // Saudações
  ];

  const isWaitingInstruction = waitingPatterns.some(pattern => pattern.test(content));
  const isFalsePositive = falsePositivePatterns.some(pattern => pattern.test(content));
  
  result.isWaiting = isWaitingInstruction && !isFalsePositive;

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
