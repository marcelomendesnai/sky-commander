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
}

export interface Settings {
  openaiApiKey: string;
  avwxApiKey: string;
  systemPrompt: string;
}

export type AppScreen = 'settings' | 'flight-setup' | 'metar' | 'chat';
