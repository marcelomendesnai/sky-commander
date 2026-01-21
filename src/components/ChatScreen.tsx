import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Radio, Brain, Loader2, AlertCircle, Volume2, VolumeX, RotateCcw, Clock } from 'lucide-react';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ChatMessage, TalkingTo } from '@/types/flight';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function MessageBubble({ 
  message, 
  onPlayAudio,
  isPlayingAudio 
}: { 
  message: ChatMessage;
  onPlayAudio?: (text: string) => void;
  isPlayingAudio?: boolean;
}) {
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
                {onPlayAudio && (
                  <button
                    onClick={() => onPlayAudio(message.content)}
                    disabled={isPlayingAudio}
                    className="ml-2 p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
                    title="Reproduzir áudio"
                  >
                    {isPlayingAudio ? (
                      <Loader2 className="w-3 h-3 text-atc-amber animate-spin" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-atc-amber" />
                    )}
                  </button>
                )}
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

function TalkingToToggle({ 
  value, 
  onChange 
}: { 
  value: TalkingTo; 
  onChange: (value: TalkingTo) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <button
        type="button"
        onClick={() => onChange('atc')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
          value === 'atc'
            ? 'bg-atc-amber/20 text-atc-amber border border-atc-amber/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Radio className="w-3.5 h-3.5" />
        <span>ATC</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('evaluator')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
          value === 'evaluator'
            ? 'bg-atc-cyan/20 text-atc-cyan border border-atc-cyan/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Brain className="w-3.5 h-3.5" />
        <span>Avaliador</span>
      </button>
    </div>
  );
}

export function ChatScreen() {
  const { messages, addMessage, flightData, settings, departureMetar, arrivalMetar, arrivalTaf } = useApp();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [talkingTo, setTalkingTo] = useState<TalkingTo>('atc');
  const [isWaiting, setIsWaiting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playTTS = async (text: string) => {
    if (!settings.elevenLabsApiKey || !audioEnabled) return;

    setIsPlayingAudio(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          text,
          apiKey: settings.elevenLabsApiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no TTS');
      }

      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        toast.error('Erro ao reproduzir áudio');
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlayingAudio(false);
      toast.error(error instanceof Error ? error.message : 'Erro no TTS');
    }
  };

  const processATCResponse = async (userMessage: string, isResume = false) => {
    setIsLoading(true);

    try {
      // Build METAR context
      const metarContext = [
        departureMetar?.raw ? `METAR ${departureMetar.icao}: ${departureMetar.raw}` : '',
        arrivalMetar?.raw ? `METAR ${arrivalMetar.icao}: ${arrivalMetar.raw}` : '',
        arrivalTaf?.raw ? `TAF ${arrivalTaf.icao}: ${arrivalTaf.raw}` : '',
      ].filter(Boolean).join('\n');

      // Build message history
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      // Prepare the message - if resuming, ask ATC to continue
      const messageToSend = isResume 
        ? '[SITUAÇÃO RESOLVIDA - ATC deve retomar contato como se o tráfego ou situação de espera tivesse passado]'
        : userMessage;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/atc-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          history,
          flightData: flightData || {
            aircraft: 'UNKNOWN',
            departureIcao: 'XXXX',
            arrivalIcao: 'XXXX',
            flightType: 'VFR',
            mode: 'TREINO',
          },
          metarContext,
          talkingTo,
          systemPrompt: settings.systemPrompt,
          anthropicApiKey: settings.anthropicApiKey,
          selectedModel: settings.selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar resposta');
      }

      const data = await response.json();

      // Update waiting state
      setIsWaiting(data.isWaiting || false);

      // Add responses to chat
      if (talkingTo === 'atc') {
        if (data.atcResponse) {
          addMessage({ role: 'atc', content: data.atcResponse });
          // Auto-play TTS for ATC response
          if (settings.elevenLabsApiKey && audioEnabled) {
            await playTTS(data.atcResponse);
          }
        }
        if (data.evaluatorResponse && flightData?.mode === 'TREINO') {
          addMessage({ role: 'evaluator', content: data.evaluatorResponse });
        }
      } else {
        if (data.evaluatorResponse) {
          addMessage({ role: 'evaluator', content: data.evaluatorResponse });
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar resposta');
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

  const handleATCResume = async () => {
    setIsWaiting(false);
    addMessage({ role: 'system', content: '⏳ Situação resolvida - ATC retomando contato...' });
    await processATCResponse('', true);
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
      {/* Audio controls header */}
      {settings.elevenLabsApiKey && (
        <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              audioEnabled
                ? 'bg-atc-green/20 text-atc-green'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Áudio ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Áudio OFF</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-3xl">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              onPlayAudio={
                message.role === 'atc' && settings.elevenLabsApiKey 
                  ? playTTS 
                  : undefined
              }
              isPlayingAudio={isPlayingAudio}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-mono">
                {talkingTo === 'atc' ? 'ATC processando...' : 'Avaliador processando...'}
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Waiting button */}
      {isWaiting && !isLoading && (
        <div className="px-4 py-3 border-t border-atc-amber/30 bg-atc-amber/10">
          <div className="container mx-auto max-w-3xl">
            <button
              onClick={handleATCResume}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-atc-amber/20 border border-atc-amber/40 text-atc-amber font-mono text-sm hover:bg-atc-amber/30 transition-colors animate-pulse"
            >
              <Clock className="w-5 h-5" />
              <span>⏳ ATC ME CHAMA</span>
              <span className="text-xs opacity-75">(clique quando situação resolver)</span>
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-3xl">
          {/* Talking To Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground">Falando com:</span>
            <TalkingToToggle value={talkingTo} onChange={setTalkingTo} />
          </div>

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
                placeholder={
                  isRecording 
                    ? 'Gravando...' 
                    : talkingTo === 'atc'
                    ? 'Digite sua comunicação para o ATC...'
                    : 'Pergunte ao avaliador...'
                }
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
