import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Radio, Brain, Loader2, AlertCircle } from 'lucide-react';
import { AtcCard } from '@/components/ui/atc-card';
import { AtcButton } from '@/components/ui/atc-button';
import { AtcInput } from '@/components/ui/atc-input';
import { useApp } from '@/contexts/AppContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ChatMessage } from '@/types/flight';
import { toast } from 'sonner';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isATC = message.role === 'atc';
  const isEvaluator = message.role === 'evaluator';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-muted text-xs font-mono text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Role indicator */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            {isATC ? (
              <>
                <Radio className="w-3 h-3 text-atc-amber" />
                <span className="text-atc-amber">ATC</span>
              </>
            ) : (
              <>
                <Brain className="w-3 h-3 text-atc-cyan" />
                <span className="text-atc-cyan">Avaliador</span>
              </>
            )}
          </div>
        )}
        
        {/* Message content */}
        <div className={`rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-primary/20 border border-primary/30 text-foreground' 
            : isATC
            ? 'bg-card border border-atc-amber/30'
            : 'bg-card border border-atc-cyan/30'
        }`}>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isATC ? 'atc-message' : isEvaluator ? 'evaluator-message' : 'font-mono'
          }`}>
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export function ChatScreen() {
  const { messages, addMessage, flightData, settings, departureMetar, arrivalMetar, arrivalTaf } = useApp();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processATCResponse = async (userMessage: string) => {
    setIsLoading(true);

    try {
      // Build context for the AI
      const metarContext = [
        departureMetar?.raw ? `METAR ${departureMetar.icao}: ${departureMetar.raw}` : '',
        arrivalMetar?.raw ? `METAR ${arrivalMetar.icao}: ${arrivalMetar.raw}` : '',
        arrivalTaf?.raw ? `TAF ${arrivalTaf.icao}: ${arrivalTaf.raw}` : '',
      ].filter(Boolean).join('\n');

      const flightContext = flightData 
        ? `Aeronave: ${flightData.aircraft}, Saída: ${flightData.departureIcao}, Chegada: ${flightData.arrivalIcao}, Tipo: ${flightData.flightType}, Modo: ${flightData.mode}`
        : '';

      // Build message history for context
      const messageHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      // For now, we'll simulate a response since we don't have direct Claude API access
      // In production, this would call an edge function with Claude
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parse the user message and generate appropriate response
      const response = generateSimulatedResponse(userMessage, flightData, messages);
      
      // Add the response(s) to chat
      if (response.atc) {
        addMessage({ role: 'atc', content: response.atc });
      }
      if (response.evaluator && flightData?.mode === 'TREINO') {
        addMessage({ role: 'evaluator', content: response.evaluator });
      }

    } catch (error) {
      toast.error('Erro ao processar resposta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    setInputText('');
    
    addMessage({ role: 'user', content: text });
    await processATCResponse(text);
  };

  const handleVoiceTranscript = async (text: string) => {
    addMessage({ role: 'user', content: text });
    await processATCResponse(text);
  };

  const { isRecording, isProcessing, error: voiceError, toggleRecording } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    apiKey: settings.openaiApiKey,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-3xl">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-mono">ATC processando...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-3xl">
          {voiceError && (
            <div className="flex items-center gap-2 text-xs text-destructive mb-3">
              <AlertCircle className="w-4 h-4" />
              {voiceError}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {/* Voice input button */}
            <AtcButton
              variant={isRecording ? 'record' : 'outline'}
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing || isLoading}
              className={isRecording ? 'animate-pulse-glow' : ''}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </AtcButton>

            {/* Text input */}
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? 'Gravando...' : 'Digite sua comunicação...'}
                disabled={isRecording || isLoading}
                className="w-full h-11 px-4 rounded-md border border-border bg-input font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            {/* Send button */}
            <AtcButton
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || isRecording}
              size="icon"
            >
              <Send className="w-5 h-5" />
            </AtcButton>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-3 text-atc-red">
              <div className="w-2 h-2 rounded-full bg-atc-red animate-blink-record" />
              <span className="text-xs font-mono uppercase">Gravando - Clique para parar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simulated response generator (placeholder for actual AI integration)
function generateSimulatedResponse(
  userMessage: string, 
  flightData: any, 
  messages: ChatMessage[]
): { atc?: string; evaluator?: string } {
  const lowerMessage = userMessage.toLowerCase();
  const isFirstContact = messages.filter(m => m.role === 'user').length === 1;

  // Basic pattern matching for demo purposes
  if (isFirstContact || lowerMessage.includes('ground') || lowerMessage.includes('solo')) {
    if (!lowerMessage.includes(flightData?.aircraft?.toLowerCase())) {
      return {
        atc: 'Station calling, say again your callsign.',
        evaluator: `❌ Você não se identificou corretamente. Toda chamada deve incluir:\n1. Estação chamada\n2. Seu indicativo (${flightData?.aircraft})\n3. Sua posição/intenção\n\nRefaça a chamada.`,
      };
    }
    
    return {
      atc: `${flightData?.aircraft}, ${flightData?.departureIcao} Ground, go ahead.`,
      evaluator: '✅ Contato inicial estabelecido. Aguardando sua solicitação de táxi ou clearance.',
    };
  }

  if (lowerMessage.includes('taxi') || lowerMessage.includes('táxi')) {
    return {
      atc: `${flightData?.aircraft}, taxi to holding point runway 09R via taxiway Alpha, Bravo. Hold short runway 09R.`,
      evaluator: '📋 Readback obrigatório:\n- Pista designada\n- Taxiways\n- Ponto de espera\n\nColoque seu indicativo no final do readback.',
    };
  }

  if (lowerMessage.includes('ready') || lowerMessage.includes('pronto')) {
    return {
      atc: `${flightData?.aircraft}, hold position. Traffic on final.`,
    };
  }

  if (lowerMessage.includes('takeoff') || lowerMessage.includes('decolagem')) {
    return {
      atc: `${flightData?.aircraft}, wind 090 degrees 8 knots, runway 09R, cleared for takeoff.`,
      evaluator: '📋 Readback obrigatório: Pista e autorização de decolagem.',
    };
  }

  // Default response
  return {
    atc: 'Say again.',
    evaluator: '⚠️ Comunicação não compreendida. Verifique:\n- Identificação correta\n- Fraseologia padrão ICAO\n- Clareza da mensagem',
  };
}
