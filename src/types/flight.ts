export interface FlightData {
  aircraft: string;
  departureIcao: string;
  arrivalIcao: string;
  flightType: 'VFR' | 'IFR';
  mode: 'TREINO' | 'REAL';
}

export interface MetarData {
  icao: string;
  raw: string;
  temperature?: number;
  dewpoint?: number;
  wind_direction?: number;
  wind_speed?: number;
  wind_gust?: number;
  visibility?: number;
  altimeter?: number;
  flight_rules?: string;
  clouds?: Array<{
    type: string;
    altitude: number;
  }>;
  time?: string;
}

export interface TafData {
  icao: string;
  raw: string;
  time?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'atc' | 'evaluator' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string; // URL do áudio TTS
}

export interface Settings {
  openaiApiKey: string;
  avwxApiKey: string;
  systemPrompt: string;
  // LLM settings
  anthropicApiKey?: string;
  selectedModel: LovableAIModel;
  // TTS settings
  elevenLabsApiKey?: string;
}

export type LovableAIModel = 
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-3-flash-preview'
  | 'openai/gpt-5-nano'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5'
  | 'google/gemini-2.5-pro';

export const LOVABLE_AI_MODELS: { value: LovableAIModel; label: string; description: string }[] = [
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Mais econômico, bom para tarefas simples' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Equilibrado - custo x performance' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', description: 'Recomendado - nova geração' },
  { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano', description: 'Econômico, rápido' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Bom custo-benefício' },
  { value: 'openai/gpt-5', label: 'GPT-5', description: 'Premium - melhor qualidade' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Topo de linha Gemini' },
];

export interface AirportData {
  icao: string;
  name: string;
  city: string;
  country: string;
  elevation: number;
  latitude: number;
  longitude: number;
  timezone?: string;
  frequencies: AirportFrequency[];
  runways: RunwayData[];
  regionalInfo?: string;
}

export interface AirportFrequency {
  type: string; // ATIS, GND, TWR, APP, DEP, CLR
  frequency: string;
  name?: string;
}

export interface RunwayData {
  ident: string;
  length: number;
  width: number;
  surface: string;
}

export interface AircraftData {
  model: string;
  manufacturer: string;
  type: 'single' | 'multi' | 'jet' | 'turboprop';
  speeds: {
    v1?: { loaded: number; light: number };
    vr?: { loaded: number; light: number };
    v2?: { loaded: number; light: number };
    vref?: { loaded: number; light: number };
    cruise?: { loaded: number; light: number };
  };
  ceiling?: number;
  range?: number;
}

export type TalkingTo = 'atc' | 'evaluator';

export type AppScreen = 'settings' | 'flight-setup' | 'metar' | 'chat';

// Frequency types for ATC communication
export type FrequencyType = 'ATIS' | 'CLR' | 'GND' | 'TWR' | 'APP' | 'DEP' | 'CTR';

export interface SelectedFrequency {
  airport: 'departure' | 'arrival';
  frequencyType: FrequencyType;
  frequency: string;
  name: string;
}

// Chronological order of frequencies for each phase
export const DEPARTURE_FREQUENCY_ORDER: FrequencyType[] = ['ATIS', 'CLR', 'GND', 'TWR', 'DEP', 'CTR'];
export const ARRIVAL_FREQUENCY_ORDER: FrequencyType[] = ['CTR', 'APP', 'TWR', 'GND'];

// ============================================
// FLIGHT PHASE TIMELINE SYSTEM
// ============================================

// All 17 flight phases
export type FlightPhase = 
  | 'PARKING_COLD'      // Pátio - Motor desligado
  | 'PARKING_HOT'       // Pátio - Motor ligado
  | 'TAXI_OUT'          // Táxi para pista
  | 'HOLDING_POINT'     // Ponto de espera
  | 'LINED_UP'          // Alinhado na pista
  | 'TAKEOFF_ROLL'      // Corrida de decolagem
  | 'INITIAL_CLIMB'     // Subida inicial
  | 'LEAVING_TMA'       // Saindo da TMA
  | 'CRUISE'            // Cruzeiro
  | 'DESCENT'           // Descida
  | 'ENTERING_TMA'      // Entrando na TMA
  | 'APPROACH'          // Aproximação
  | 'FINAL'             // Final
  | 'LANDING'           // Pouso/Flare
  | 'ROLLOUT'           // Rollout
  | 'TAXI_IN'           // Táxi para pátio
  | 'PARKING_ARRIVED';  // Pátio - Estacionado

// Service types that can be expected per phase
export type ExpectedService = 'ATIS' | 'CLR' | 'GND' | 'TWR' | 'DEP' | 'APP' | 'CTR' | 'NONE';

// Flight phase metadata with validation rules
export interface FlightPhaseInfo {
  id: FlightPhase;
  label: string;
  shortLabel: string;
  icon: string;
  position: number; // 0-100 for timeline positioning
  
  // Communication rules
  expectedService: {
    VFR: ExpectedService[];
    IFR: ExpectedService[];
  };
  communicationAllowed: boolean;
  silenceRequired: boolean;
  airport: 'departure' | 'arrival' | 'enroute';
  atcInitiatesContact: boolean; // Se true, ATC chama o piloto nesta fase
  
  // Validation messages
  silenceMessage?: string;
  expectedServiceHint?: string;
  atcContactMessage?: string; // Mensagem contextual quando ATC inicia contato
}

// All flight phases with their validation rules
export const FLIGHT_PHASES: FlightPhaseInfo[] = [
  {
    id: 'PARKING_COLD',
    label: 'Pátio - Motor Desligado',
    shortLabel: 'COLD',
    icon: '🅿️',
    position: 0,
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    communicationAllowed: false,
    silenceRequired: true,
    airport: 'departure',
    atcInitiatesContact: false,
    silenceMessage: 'Motor desligado. Nenhuma comunicação deve ser iniciada.',
  },
  {
    id: 'PARKING_HOT',
    label: 'Pátio - Motor Ligado',
    shortLabel: 'HOT',
    icon: '🔧',
    position: 6,
    expectedService: { 
      VFR: ['ATIS', 'GND'],
      IFR: ['ATIS', 'CLR', 'GND']
    },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'departure',
    atcInitiatesContact: false,
    expectedServiceHint: 'VFR: ATIS → SOLO | IFR: ATIS → CLR → SOLO',
  },
  {
    id: 'TAXI_OUT',
    label: 'Táxi para Pista',
    shortLabel: 'TAXI',
    icon: '🚶',
    position: 12,
    expectedService: { VFR: ['GND'], IFR: ['GND'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'departure',
    atcInitiatesContact: false,
    expectedServiceHint: 'Em comunicação com SOLO (Ground)',
  },
  {
    id: 'HOLDING_POINT',
    label: 'Ponto de Espera',
    shortLabel: 'HOLD',
    icon: '⏸️',
    position: 18,
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'departure',
    atcInitiatesContact: false,
    expectedServiceHint: 'Contatar TORRE para autorização de decolagem',
  },
  {
    id: 'LINED_UP',
    label: 'Alinhado na Pista',
    shortLabel: 'RWY',
    icon: '➡️',
    position: 24,
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'departure',
    atcInitiatesContact: true,
    expectedServiceHint: 'Aguardando autorização final da TORRE',
    atcContactMessage: 'Aguardando autorização de decolagem...',
  },
  {
    id: 'TAKEOFF_ROLL',
    label: 'Corrida de Decolagem',
    shortLabel: 'TKOF',
    icon: '🛫',
    position: 30,
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    communicationAllowed: false,
    silenceRequired: true,
    airport: 'departure',
    atcInitiatesContact: false,
    silenceMessage: 'Corrida de decolagem. Silêncio absoluto - concentração total.',
  },
  {
    id: 'INITIAL_CLIMB',
    label: 'Subida Inicial',
    shortLabel: 'CLB',
    icon: '⬆️',
    position: 38,
    expectedService: { VFR: ['TWR', 'DEP'], IFR: ['TWR', 'DEP'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'departure',
    atcInitiatesContact: true,
    expectedServiceHint: 'TORRE pode transferir para DEP',
    atcContactMessage: 'Aguardando transferência para DEP...',
  },
  {
    id: 'LEAVING_TMA',
    label: 'Saindo da TMA',
    shortLabel: 'TMA↑',
    icon: '📡',
    position: 46,
    expectedService: { VFR: ['DEP', 'CTR'], IFR: ['DEP', 'CTR'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'enroute',
    atcInitiatesContact: true,
    expectedServiceHint: 'IFR: DEP/CTR contínuo | VFR: pode se despedir do radar',
    atcContactMessage: 'Aguardando transferência para CTR...',
  },
  {
    id: 'CRUISE',
    label: 'Cruzeiro',
    shortLabel: 'CRZ',
    icon: '✈️',
    position: 54,
    expectedService: { VFR: ['CTR', 'NONE'], IFR: ['CTR'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'enroute',
    atcInitiatesContact: true,
    expectedServiceHint: 'IFR: CTR | VFR: apenas se necessário',
    atcContactMessage: 'Aguardando contato do CTR...',
  },
  {
    id: 'DESCENT',
    label: 'Descida',
    shortLabel: 'DES',
    icon: '📉',
    position: 62,
    expectedService: { VFR: ['CTR', 'APP'], IFR: ['CTR', 'APP'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'enroute',
    atcInitiatesContact: true,
    expectedServiceHint: 'CTR → APP, recebe QNH de destino',
    atcContactMessage: 'Aguardando autorização de descida...',
  },
  {
    id: 'ENTERING_TMA',
    label: 'Entrando na TMA',
    shortLabel: 'TMA↓',
    icon: '🎯',
    position: 68,
    expectedService: { VFR: ['APP'], IFR: ['APP'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'arrival',
    atcInitiatesContact: true,
    expectedServiceHint: 'Contato obrigatório com APP',
    atcContactMessage: 'Aguardando transferência para APP...',
  },
  {
    id: 'APPROACH',
    label: 'Aproximação',
    shortLabel: 'APP',
    icon: '🔽',
    position: 74,
    expectedService: { VFR: ['APP'], IFR: ['APP'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'arrival',
    atcInitiatesContact: true,
    expectedServiceHint: 'IFR: vetores e autorização | VFR: instruções visuais',
    atcContactMessage: 'Aguardando vetores/sequenciamento...',
  },
  {
    id: 'FINAL',
    label: 'Final',
    shortLabel: 'FNL',
    icon: '🛬',
    position: 80,
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'arrival',
    atcInitiatesContact: true,
    expectedServiceHint: 'Transferido para TORRE de destino',
    atcContactMessage: 'Aguardando transferência para TWR...',
  },
  {
    id: 'LANDING',
    label: 'Pouso / Flare',
    shortLabel: 'LDG',
    icon: '⬇️',
    position: 86,
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    communicationAllowed: false,
    silenceRequired: true,
    airport: 'arrival',
    atcInitiatesContact: false,
    silenceMessage: 'Pouso em andamento. Silêncio - apenas readback se necessário.',
  },
  {
    id: 'ROLLOUT',
    label: 'Rollout',
    shortLabel: 'ROLL',
    icon: '🚦',
    position: 90,
    expectedService: { VFR: ['TWR'], IFR: ['TWR'] },
    communicationAllowed: false,
    silenceRequired: true,
    airport: 'arrival',
    atcInitiatesContact: true,
    silenceMessage: 'Rollout. Aguardar desacelerar, TORRE pode instruir saída.',
    atcContactMessage: 'Aguardando instrução de saída de pista...',
  },
  {
    id: 'TAXI_IN',
    label: 'Táxi para Pátio',
    shortLabel: 'TAXI',
    icon: '🚶',
    position: 94,
    expectedService: { VFR: ['GND'], IFR: ['GND'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'arrival',
    atcInitiatesContact: true,
    expectedServiceHint: 'TORRE instrui → contato com SOLO de destino',
    atcContactMessage: 'Aguardando transferência para GND...',
  },
  {
    id: 'PARKING_ARRIVED',
    label: 'Pátio - Estacionado',
    shortLabel: 'PARK',
    icon: '🅿️',
    position: 100,
    expectedService: { VFR: ['NONE'], IFR: ['NONE'] },
    communicationAllowed: true,
    silenceRequired: false,
    airport: 'arrival',
    atcInitiatesContact: false,
    expectedServiceHint: 'Fim das comunicações. Debriefing disponível.',
  },
];

// Helper to get phase info by ID
export function getFlightPhaseInfo(phase: FlightPhase): FlightPhaseInfo | undefined {
  return FLIGHT_PHASES.find(p => p.id === phase);
}

// Helper to validate communication for a phase
export function validatePhaseForCommunication(
  phase: FlightPhase,
  selectedFrequency: SelectedFrequency | null,
  flightType: 'VFR' | 'IFR'
): { isValid: boolean; error?: string; warning?: string } {
  const phaseInfo = getFlightPhaseInfo(phase);
  if (!phaseInfo) {
    return { isValid: false, error: 'Fase de voo inválida.' };
  }

  // Phase requires silence
  if (phaseInfo.silenceRequired) {
    return { 
      isValid: false, 
      error: phaseInfo.silenceMessage || `Fase "${phaseInfo.label}": Silêncio obrigatório.`
    };
  }

  // Communication not allowed in this phase
  if (!phaseInfo.communicationAllowed) {
    return { 
      isValid: false, 
      error: `Nesta fase, não há comunicação esperada.`
    };
  }

  // Check if frequency matches expected service for this phase
  const expectedServices = phaseInfo.expectedService[flightType];
  
  // If no frequency selected but communication is allowed, just warn
  if (!selectedFrequency) {
    if (!expectedServices.includes('NONE')) {
      return {
        isValid: true,
        warning: `Fase "${phaseInfo.label}": Deveria estar em contato com ${expectedServices.join(' ou ')}.`
      };
    }
    return { isValid: true };
  }

  // Check if selected frequency matches expected
  const freqType = selectedFrequency.frequencyType as ExpectedService;
  if (!expectedServices.includes(freqType) && !expectedServices.includes('NONE')) {
    return {
      isValid: false,
      error: `Fase "${phaseInfo.label}": Você deveria estar em contato com ${expectedServices.join(' ou ')}, não com ${freqType}.`
    };
  }

  return { isValid: true };
}
