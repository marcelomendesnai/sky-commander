import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FlightData, MetarData, TafData, ChatMessage, Settings, AppScreen, AirportData, LovableAIModel, FlightPhase } from '@/types/flight';

const DEFAULT_MODEL: LovableAIModel = 'google/gemini-3-flash-preview';
const DEFAULT_PHASE: FlightPhase = 'PARKING_COLD';

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

🚫 Nunca misture instrução didática com comunicação de rádio.

## REGRAS OPERACIONAIS DE COMUNICAÇÃO

### Confirmação de Readback
- **Silêncio = confirmação**: Após readback correto, NÃO confirme verbalmente.
- Fale APENAS para: nova instrução, correção, ou gatilho obrigatório.
- Não repita informações já estabilizadas (pista, QNH, altitude se já confirmados).

### Gestão de QNH
- Informe QNH UMA VEZ por fase/setor.
- Repita APENAS se: mudança de setor, mudança de fase (cruzeiro→descida), valor alterado, ou risco de erro vertical.
- Não use QNH como reforço didático.

### Readback e Autorização
- Exija readback APENAS de autorizações explícitas (altitude, proa, runway, clearance).
- NÃO cobre readback de "expectativas" (ex: "espere vetores").
- Diferencie: Autorização (exige readback) vs Informação (não exige).

### Fluxo Operacional
- Em fases críticas (final, pouso, taxi pós-pouso): comunicação mínima.
- Avaliações longas vão para debriefing, não durante a fase.

### Erros de Ditado/Áudio
- Distorções de transcrição (ex: "KNH" em vez de "QNH", "Kenya" por "Kilo") são RUÍDO de áudio.
- NÃO trate como erro conceitual se o contexto for inequívoco.
- Corrija forma APENAS quando comprometer segurança ou entendimento.

### Realismo Operacional
- Priorize realismo sobre pedagogia excessiva.
- Fraseologia seca e operacional. Evite verbos didáticos em excesso.

### Terminologia de Setores (ICAO Brasil)
- GND = "Solo" (Ground)
- TWR = "Torre" (Tower)
- DEP = "Controle de Saída" ou "Controle [cidade]" (NUNCA use "Decolagem")
- APP = "Aproximação" (Approach)
- CTR = "Centro" (Center)

### Verificação de Destino
- Se o piloto mencionar um destino DIFERENTE do plano de voo, você DEVE questionar.
- Exemplo: "Confirme destino: seu plano indica SBRJ, você mencionou SBSP."
- NÃO aceite mudança de destino silenciosamente.

### Uso de Frequências
- SEMPRE use frequências EXATAS fornecidas no contexto de voo.
- NUNCA invente frequências.
- Se um setor não tiver frequência disponível (INDISPONÍVEL), NÃO transfira para ele.
- Exemplo: Se CTR está indisponível, mantenha em DEP ou informe "mantemos em frequência".`;

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
  
  // Airport data
  departureAirport: AirportData | null;
  arrivalAirport: AirportData | null;
  setDepartureAirport: (airport: AirportData | null) => void;
  setArrivalAirport: (airport: AirportData | null) => void;
  
  // Chat
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Navigation
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  
  // Flight phase timeline
  currentFlightPhase: FlightPhase;
  setCurrentFlightPhase: (phase: FlightPhase) => void;
  
  // Actions
  startNewFlight: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('atc-virtual-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure selectedModel has a default value
        return { 
          openaiApiKey: '', 
          avwxApiKey: '', 
          systemPrompt: DEFAULT_PROMPT,
          selectedModel: DEFAULT_MODEL,
          ...parsed 
        };
      } catch {
        return { openaiApiKey: '', avwxApiKey: '', systemPrompt: DEFAULT_PROMPT, selectedModel: DEFAULT_MODEL };
      }
    }
    return { openaiApiKey: '', avwxApiKey: '', systemPrompt: DEFAULT_PROMPT, selectedModel: DEFAULT_MODEL };
  });

  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [departureMetar, setDepartureMetar] = useState<MetarData | null>(null);
  const [arrivalMetar, setArrivalMetar] = useState<MetarData | null>(null);
  const [arrivalTaf, setArrivalTaf] = useState<TafData | null>(null);
  const [departureAirport, setDepartureAirport] = useState<AirportData | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<AirportData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('flight-setup');
  const [currentFlightPhase, setCurrentFlightPhase] = useState<FlightPhase>(DEFAULT_PHASE);

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
    setDepartureAirport(null);
    setArrivalAirport(null);
    clearMessages();
    setCurrentFlightPhase(DEFAULT_PHASE);
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
        departureAirport,
        arrivalAirport,
        setDepartureAirport,
        setArrivalAirport,
        messages,
        addMessage,
        clearMessages,
        currentScreen,
        setCurrentScreen,
        currentFlightPhase,
        setCurrentFlightPhase,
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
