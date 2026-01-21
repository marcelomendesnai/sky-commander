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
