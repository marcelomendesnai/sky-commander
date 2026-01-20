import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FlightData, MetarData, TafData, ChatMessage, Settings, AppScreen } from '@/types/flight';

const DEFAULT_PROMPT = `# ATC VIRTUAL

# TOP-P do assistente: 0.1
# Temperatura do assistente: 0.1

## PAPEL DO ASSISTENTE

Você atuará **exclusivamente como ATC (Air Traffic Control)** em um simulador de voo, acumulando **duas funções simultâneas**:

1. **ATC Operacional [iniciar mensagem com "📡 ATC:"]**
   - Emite autorizações
   - Dá instruções
   - Controla fluxo, pista, vento, QNH e tráfego fictício
   - Usa fraseologia padrão ICAO
   - Estranha comunicações incorretas como um ATC real

2. **Instrutor Avaliador [iniciar mensagem com "🧠 Avaliador:"]**
   - Analisa cada chamada do piloto
   - Corrige erros sem suavizar
   - Exige repetição correta quando necessário
   - Faz debriefing técnico por fase ou por voo

🚫 Nunca misture instrução didática com comunicação de rádio.`;

interface AppContextType {
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Flight data
  flightData: FlightData | null;
  setFlightData: (data: FlightData | null) => void;
  
  // METAR/TAF
  departureMetar: MetarData | null;
  arrivalMetar: MetarData | null;
  arrivalTaf: TafData | null;
  setDepartureMetar: (metar: MetarData | null) => void;
  setArrivalMetar: (metar: MetarData | null) => void;
  setArrivalTaf: (taf: TafData | null) => void;
  
  // Chat
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Navigation
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  
  // Actions
  startNewFlight: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('atc-virtual-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { openaiApiKey: '', avwxApiKey: '', systemPrompt: DEFAULT_PROMPT };
      }
    }
    return { openaiApiKey: '', avwxApiKey: '', systemPrompt: DEFAULT_PROMPT };
  });

  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [departureMetar, setDepartureMetar] = useState<MetarData | null>(null);
  const [arrivalMetar, setArrivalMetar] = useState<MetarData | null>(null);
  const [arrivalTaf, setArrivalTaf] = useState<TafData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('flight-setup');

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('atc-virtual-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const startNewFlight = useCallback(() => {
    setFlightData(null);
    setDepartureMetar(null);
    setArrivalMetar(null);
    setArrivalTaf(null);
    clearMessages();
    setCurrentScreen('flight-setup');
  }, [clearMessages]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        flightData,
        setFlightData,
        departureMetar,
        arrivalMetar,
        arrivalTaf,
        setDepartureMetar,
        setArrivalMetar,
        setArrivalTaf,
        messages,
        addMessage,
        clearMessages,
        currentScreen,
        setCurrentScreen,
        startNewFlight,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
