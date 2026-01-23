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
  currentPhase?: string; // Flight phase from timeline
}

// Flight phase metadata for validation and context
interface FlightPhaseInfo {
  id: string;
  label: string;
  expectedService: {
    VFR: string[];
    IFR: string[];
  };
  silenceRequired: boolean;
  airport: 'departure' | 'arrival' | 'enroute';
  silenceMessage?: string;
  expectedServiceHint?: string;
}

// All flight phases with their rules - must match frontend
const FLIGHT_PHASES: Record<string, FlightPhaseInfo> = {
  'PARKING_COLD': {
    id: 'PARKING_COLD', label: 'Pátio - Motor Desligado',
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    silenceRequired: true, airport: 'departure',
    silenceMessage: 'Motor desligado. Nenhuma comunicação deve ser iniciada.'
  },
  'PARKING_HOT': {
    id: 'PARKING_HOT', label: 'Pátio - Motor Ligado',
    expectedService: { VFR: ['ATIS', 'GND'], IFR: ['ATIS', 'CLR', 'GND'] },
    silenceRequired: false, airport: 'departure',
    expectedServiceHint: 'VFR: ATIS → SOLO | IFR: ATIS → CLR → SOLO'
  },
  'TAXI_OUT': {
    id: 'TAXI_OUT', label: 'Táxi para Pista',
    expectedService: { VFR: ['GND'], IFR: ['GND'] },
    silenceRequired: false, airport: 'departure',
    expectedServiceHint: 'Em comunicação com SOLO (Ground)'
  },
  'HOLDING_POINT': {
    id: 'HOLDING_POINT', label: 'Ponto de Espera',
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    silenceRequired: false, airport: 'departure',
    expectedServiceHint: 'Contatar TORRE para autorização'
  },
  'LINED_UP': {
    id: 'LINED_UP', label: 'Alinhado na Pista',
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    silenceRequired: false, airport: 'departure'
  },
  'TAKEOFF_ROLL': {
    id: 'TAKEOFF_ROLL', label: 'Corrida de Decolagem',
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    silenceRequired: true, airport: 'departure',
    silenceMessage: 'Corrida de decolagem. Silêncio absoluto.'
  },
  'INITIAL_CLIMB': {
    id: 'INITIAL_CLIMB', label: 'Subida Inicial',
    expectedService: { VFR: ['TWR', 'DEP'], IFR: ['TWR', 'DEP'] },
    silenceRequired: false, airport: 'departure'
  },
  'LEAVING_TMA': {
    id: 'LEAVING_TMA', label: 'Saindo da TMA',
    expectedService: { VFR: ['DEP', 'CTR'], IFR: ['DEP', 'CTR'] },
    silenceRequired: false, airport: 'enroute'
  },
  'CRUISE': {
    id: 'CRUISE', label: 'Cruzeiro',
    expectedService: { VFR: ['CTR', 'NONE'], IFR: ['CTR'] },
    silenceRequired: false, airport: 'enroute'
  },
  'DESCENT': {
    id: 'DESCENT', label: 'Descida',
    expectedService: { VFR: ['CTR', 'APP'], IFR: ['CTR', 'APP'] },
    silenceRequired: false, airport: 'enroute'
  },
  'ENTERING_TMA': {
    id: 'ENTERING_TMA', label: 'Entrando na TMA',
    expectedService: { VFR: ['APP'], IFR: ['APP'] },
    silenceRequired: false, airport: 'arrival'
  },
  'APPROACH': {
    id: 'APPROACH', label: 'Aproximação',
    expectedService: { VFR: ['APP'], IFR: ['APP'] },
    silenceRequired: false, airport: 'arrival'
  },
  'FINAL': {
    id: 'FINAL', label: 'Final',
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    silenceRequired: false, airport: 'arrival'
  },
  'LANDING': {
    id: 'LANDING', label: 'Pouso / Flare',
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    silenceRequired: true, airport: 'arrival',
    silenceMessage: 'Pouso em andamento. Silêncio.'
  },
  'ROLLOUT': {
    id: 'ROLLOUT', label: 'Rollout',
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    silenceRequired: true, airport: 'arrival',
    silenceMessage: 'Rollout. Aguardar instruções da TORRE.'
  },
  'TAXI_IN': {
    id: 'TAXI_IN', label: 'Táxi para Pátio',
    expectedService: { VFR: ['GND'], IFR: ['GND'] },
    silenceRequired: false, airport: 'arrival'
  },
  'PARKING_ARRIVED': {
    id: 'PARKING_ARRIVED', label: 'Pátio - Estacionado',
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    silenceRequired: false, airport: 'arrival',
    expectedServiceHint: 'Fim das comunicações'
  }
};

// Build phase context for the AI prompt
function buildPhaseContext(
  currentPhase: string | undefined,
  flightType: string,
  selectedFrequency: SelectedFrequency | null
): string {
  if (!currentPhase) return '';
  
  const phaseInfo = FLIGHT_PHASES[currentPhase];
  if (!phaseInfo) return '';
  
  const expectedServices = phaseInfo.expectedService[flightType as 'VFR' | 'IFR'] || [];
  const airportRef = phaseInfo.airport === 'departure' ? 'SAÍDA' : 
                     phaseInfo.airport === 'arrival' ? 'DESTINO' : 'ROTA';
  
  let context = `
📍 **FASE ATUAL DO VOO: ${phaseInfo.label}**
- Aeroporto de referência: ${airportRef}
- Serviço esperado (${flightType}): ${expectedServices.includes('NONE') ? 'Nenhum' : expectedServices.join(' ou ')}
- Silêncio obrigatório: ${phaseInfo.silenceRequired ? 'SIM ⚠️' : 'Não'}
`;

  if (phaseInfo.silenceRequired && phaseInfo.silenceMessage) {
    context += `- ⚠️ ${phaseInfo.silenceMessage}\n`;
  }

  if (phaseInfo.expectedServiceHint) {
    context += `- Dica: ${phaseInfo.expectedServiceHint}\n`;
  }

  // Validation rules for the AI
  context += `
**VALIDAÇÃO DE FASE - REGRAS PARA O ATC/AVALIADOR:**

1. Se a fase exige SILÊNCIO (${phaseInfo.silenceRequired ? 'ESTA FASE EXIGE' : 'esta fase não exige'}):
   - O ATC deve estranhar a comunicação
   - O Avaliador deve corrigir: "Nesta fase (${phaseInfo.label}), o piloto não deveria estar transmitindo."

2. Se o piloto está no SERVIÇO ERRADO para a fase:
   - Fase atual: ${phaseInfo.label}
   - Serviços esperados: ${expectedServices.join(', ')}
   ${selectedFrequency ? `- Frequência sintonizada: ${selectedFrequency.frequencyType}` : '- Nenhuma frequência selecionada'}
   ${selectedFrequency && !expectedServices.includes(selectedFrequency.frequencyType) && !expectedServices.includes('NONE') 
     ? `- ⚠️ INCONSISTÊNCIA: Piloto sintonizado em ${selectedFrequency.frequencyType}, mas deveria estar em ${expectedServices.join(' ou ')}`
     : ''}

3. PROGRESSÃO ESPERADA:
   - Antes de taxiar: SOLO (Ground)
   - No ponto de espera: TORRE
   - Após decolagem: TORRE → DEP
   - Em rota: CTR
   - Na chegada: APP → TORRE → SOLO
`;

  return context;
}

// Função para gerar ATIS no padrão ICAO operacional
// Ordem: ID+Letra → Hora → Vento → Visibilidade → Fenômenos → Nuvens → Temp/DP → QNH → Pista → Instrução
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
  
  const airportName = selectedFrequency.name
    .replace(/^ATIS\s*/i, '')
    .trim() || airportIcao;
  
  // Hora atual Zulu
  const now = new Date();
  const zuluTime = `${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}`;
  
  // === PARSE DO METAR ===
  
  // 3. VENTO
  let wind = 'Vento calmo';
  let windDirection = 0;
  const windMatch = metarContext.match(/Vento:\s*(\d+)[°º]?\s*(?:graus?)?\s*[,/]?\s*(\d+)\s*(?:nós|kt)/i);
  const windCalmMatch = metarContext.match(/Vento:\s*(calmo|calm|vrb)/i);
  if (windMatch) {
    windDirection = parseInt(windMatch[1]);
    const windSpeed = parseInt(windMatch[2]);
    wind = `Vento ${String(windDirection).padStart(3, '0')} graus, ${windSpeed} nós`;
  } else if (windCalmMatch) {
    wind = 'Vento calmo';
  }
  
  // 4. VISIBILIDADE
  let visibility = 'Visibilidade mais de 10 quilômetros';
  let visibilityMeters = 9999;
  const visMatch = metarContext.match(/Visibilidade:\s*(\d+)\s*(metros?|m|km|quilômetros?)/i);
  if (visMatch) {
    const visValue = parseInt(visMatch[1]);
    const visUnit = visMatch[2].toLowerCase();
    if (visUnit.startsWith('k') || visUnit.startsWith('q')) {
      visibilityMeters = visValue * 1000;
      visibility = `Visibilidade ${visValue} quilômetros`;
    } else {
      visibilityMeters = visValue;
      visibility = visValue >= 9999 
        ? 'Visibilidade mais de 10 quilômetros'
        : `Visibilidade ${visValue} metros`;
    }
  }
  
  // 5. FENÔMENOS METEOROLÓGICOS
  const phenomena: string[] = [];
  if (/chuva\s*forte|(\+ra|heavy\s*rain)/i.test(metarContext)) phenomena.push('chuva forte');
  else if (/chuva\s*fraca|(-ra|light\s*rain)/i.test(metarContext)) phenomena.push('chuva fraca');
  else if (/chuva|(\bra\b|rain)/i.test(metarContext)) phenomena.push('chuva');
  if (/nevoeiro|(\bfg\b|fog)/i.test(metarContext)) phenomena.push('nevoeiro');
  else if (/névoa|(\bbr\b|mist)/i.test(metarContext)) phenomena.push('névoa');
  if (/trovoada|(\bts\b|thunder)/i.test(metarContext)) phenomena.push('trovoada');
  if (/granizo|(\bgr\b|hail)/i.test(metarContext)) phenomena.push('granizo');
  
  const hasPhenomena = phenomena.length > 0;
  const phenomenaLine = hasPhenomena ? phenomena.join(' e ').charAt(0).toUpperCase() + phenomena.join(' e ').slice(1) : null;
  
  // 6. NUVENS
  let clouds: string[] = [];
  let hasSignificantClouds = false;
  
  // Parse cloud patterns: FEW, SCT, BKN, OVC with altitude
  const cloudPatterns = metarContext.matchAll(/(poucas|dispersas|quebradas?|encoberto|few|sct|bkn|ovc)\s*(?:a\s*)?(\d+)\s*(pés|ft|feet)?/gi);
  for (const match of cloudPatterns) {
    const type = match[1].toLowerCase();
    const altitude = parseInt(match[2]);
    let typeText = '';
    
    if (type === 'few' || type === 'poucas') typeText = 'poucas nuvens';
    else if (type === 'sct' || type === 'dispersas') typeText = 'nuvens dispersas';
    else if (type === 'bkn' || type.startsWith('quebrad')) {
      typeText = 'nuvens quebradas';
      hasSignificantClouds = true;
    } else if (type === 'ovc' || type === 'encoberto') {
      typeText = 'encoberto';
      hasSignificantClouds = true;
    }
    
    if (typeText) {
      clouds.push(`${typeText} ${altitude} pés`);
    }
  }
  
  // Também verificar formato "Nuvens: BKN007 OVC013"
  const cloudRaw = metarContext.match(/(?:Nuvens?|Clouds?):\s*([^\n]+)/i);
  if (cloudRaw && clouds.length === 0) {
    const rawClouds = cloudRaw[1];
    if (/bkn|quebrad/i.test(rawClouds)) hasSignificantClouds = true;
    if (/ovc|encoberto/i.test(rawClouds)) hasSignificantClouds = true;
    
    // Parse formato METAR: BKN007 OVC013
    const metarClouds = rawClouds.matchAll(/(FEW|SCT|BKN|OVC)(\d{3})/gi);
    for (const mc of metarClouds) {
      const type = mc[1].toUpperCase();
      const altitude = parseInt(mc[2]) * 100; // METAR altitude em centenas de pés
      let typeText = '';
      
      if (type === 'FEW') typeText = 'poucas nuvens';
      else if (type === 'SCT') typeText = 'nuvens dispersas';
      else if (type === 'BKN') { typeText = 'nuvens quebradas'; hasSignificantClouds = true; }
      else if (type === 'OVC') { typeText = 'encoberto'; hasSignificantClouds = true; }
      
      if (typeText) clouds.push(`${typeText} ${altitude} pés`);
    }
  }
  
  // Verificar se céu claro (apenas se não há fenômenos nem nuvens)
  const isClearSky = !hasPhenomena && !hasSignificantClouds && clouds.length === 0 &&
    (metarContext.match(/céu\s*claro|clear|clr|skc|cavok/i) || visibilityMeters >= 9999);
  
  // 7. TEMPERATURA E PONTO DE ORVALHO
  let tempDewpoint = '';
  
  // Formato METAR raw: 18/16 ou M02/M05 (temperatura/ponto de orvalho)
  const tempRawMatch = metarContext.match(/\s(M?\d{2})\/(M?\d{2})\s/);
  
  // Formato decodificado: "Temperatura: 18" ou "Dewpoint: 16"
  const tempDecodedMatch = metarContext.match(/Temperatura:\s*(-?\d+)[°º]?C?/i);
  const dewDecodedMatch = metarContext.match(/(?:Ponto de orvalho|Dewpoint):\s*(-?\d+)[°º]?C?/i);
  
  if (tempRawMatch) {
    // M indica negativo no METAR (M05 = -5°C)
    const tempStr = tempRawMatch[1];
    const dewStr = tempRawMatch[2];
    const temp = tempStr.startsWith('M') ? -parseInt(tempStr.slice(1)) : parseInt(tempStr);
    const dew = dewStr.startsWith('M') ? -parseInt(dewStr.slice(1)) : parseInt(dewStr);
    tempDewpoint = `Temperatura ${temp}, ponto de orvalho ${dew}`;
  } else if (tempDecodedMatch) {
    const temp = tempDecodedMatch[1];
    const dew = dewDecodedMatch ? dewDecodedMatch[1] : null;
    tempDewpoint = dew 
      ? `Temperatura ${temp}, ponto de orvalho ${dew}`
      : `Temperatura ${temp}`;
  }
  
  if (!tempDewpoint) {
    tempDewpoint = 'Temperatura 15, ponto de orvalho 10'; // ISA padrão
  }
  
  // 8. QNH
  let qnh = '';
  
  // Formato METAR raw: Q1018 (padrão internacional)
  const qnhRawMatch = metarContext.match(/\bQ(\d{4})\b/i);
  
  // Formato decodificado: "QNH: 1018" ou "Altímetro: 1018"
  const qnhDecodedMatch = metarContext.match(/(?:QNH|Altímetro):\s*(\d{4})\s*(?:hPa|hectopascals?)?/i);
  
  // Formato americano: A2992 (polegadas de mercúrio)
  const altInHgMatch = metarContext.match(/\bA(\d{4})\b/);
  
  if (qnhRawMatch) {
    qnh = `QNH ${qnhRawMatch[1]}`;
  } else if (qnhDecodedMatch) {
    qnh = `QNH ${qnhDecodedMatch[1]}`;
  } else if (altInHgMatch) {
    // Converter de inHg para hPa
    const inhg = parseFloat(altInHgMatch[1]) / 100; // A2992 = 29.92 inHg
    const hpa = Math.round(inhg * 33.8639);
    qnh = `QNH ${hpa}`;
  }
  
  // QNH é OBRIGATÓRIO em ATIS - nunca deve estar vazio
  if (!qnh) {
    qnh = 'QNH 1013'; // ISA padrão
  }
  
  // 9. PISTA EM USO (inferir do vento)
  let runway = 'Pista principal em uso';
  if (windDirection > 0) {
    const runwayNum = Math.round(windDirection / 10);
    const rwyIdent = runwayNum === 0 ? 36 : runwayNum;
    runway = `Pista em uso ${String(rwyIdent).padStart(2, '0')}`;
  }
  
  // === CÁLCULO DE CAVOK ===
  // CAVOK = visibilidade >= 10km + sem fenômenos + sem nuvens significativas abaixo de 5000ft
  const isCavok = visibilityMeters >= 9999 && !hasPhenomena && !hasSignificantClouds && isClearSky;
  
  // === MONTAGEM NA ORDEM ICAO ===
  const atisLines: string[] = [];
  
  // 1-2. Identificação + hora
  atisLines.push(`${airportName} informação ${infoLetter}, hora ${zuluTime} Zulu.`);
  
  // 3. Vento
  atisLines.push(`${wind}.`);
  
  // 4-6. Visibilidade, fenômenos, nuvens (ou CAVOK)
  if (isCavok) {
    atisLines.push('CAVOK.');
  } else {
    atisLines.push(`${visibility}.`);
    if (phenomenaLine) {
      atisLines.push(`${phenomenaLine}.`);
    }
    if (clouds.length > 0) {
      atisLines.push(`${clouds.join(', ')}.`);
    }
  }
  
  // 7. Temperatura e ponto de orvalho
  atisLines.push(`${tempDewpoint}.`);
  
  // 8. QNH
  atisLines.push(`${qnh}.`);
  
  // 9. Pista em uso
  atisLines.push(`${runway}.`);
  
  // 10. Instrução final
  atisLines.push(`Ao contato inicial, informe ter ${infoLetter}.`);
  
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
      currentPhase,
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

    // Build phase context
    const phaseContext = buildPhaseContext(currentPhase, flightData.flightType, selectedFrequency || null);

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
${phaseContext}

## INSTRUÇÃO DE RESPOSTA

${talkingTo === 'atc' ? `
Você está respondendo como ATC. O piloto está falando com você pelo rádio.
${flightData.mode === 'TREINO' ? `
IMPORTANTE: Após sua resposta como ATC, adicione uma avaliação como instrutor.
O Avaliador DEVE verificar se a comunicação é apropriada para a FASE DO VOO atual.
Formate assim:
📡 ATC: [sua resposta como controlador]

🧠 Avaliador: [sua análise técnica - incluindo verificação de fase do voo]
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
