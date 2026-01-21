import { useState } from 'react';
import { Key, Cloud, FileText, Save, Eye, EyeOff, Cpu, Volume2, Info } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { AtcInput } from '@/components/ui/atc-input';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LOVABLE_AI_MODELS, type LovableAIModel } from '@/types/flight';

export function SettingsScreen() {
  const { settings, updateSettings, setCurrentScreen } = useApp();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAVWX, setShowAVWX] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showElevenLabs, setShowElevenLabs] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Configurações salvas com sucesso!');
    setCurrentScreen('flight-setup');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-mono font-bold text-primary mb-2">
          CONFIGURAÇÕES
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure suas chaves de API e personalize o sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* LLM Configuration Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono font-semibold text-primary flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Modelo de IA (LLM)
          </h3>

          {/* Anthropic Claude API Key */}
          <AtcCard>
            <AtcCardHeader>
              <Key className="w-5 h-5 text-atc-amber" />
              <AtcCardTitle>API Key Anthropic (Claude)</AtcCardTitle>
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">OPCIONAL</span>
            </AtcCardHeader>
            <AtcCardContent>
              <div className="flex items-start gap-2 mb-4 p-3 bg-muted/50 rounded-md border border-border">
                <Info className="w-4 h-4 text-atc-cyan mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Se preenchida, usará Claude como LLM. Caso contrário, usará o modelo Lovable AI selecionado abaixo (gratuito).
                </p>
              </div>
              <div className="relative">
                <AtcInput
                  type={showAnthropic ? 'text' : 'password'}
                  value={localSettings.anthropicApiKey || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, anthropicApiKey: e.target.value }))}
                  placeholder="sk-ant-..."
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </AtcCardContent>
          </AtcCard>

          {/* Lovable AI Model Selector */}
          <AtcCard>
            <AtcCardHeader>
              <Cpu className="w-5 h-5 text-atc-green" />
              <AtcCardTitle>Modelo Lovable AI</AtcCardTitle>
              {localSettings.anthropicApiKey && (
                <span className="ml-auto text-[10px] text-atc-amber bg-atc-amber/20 px-2 py-0.5 rounded">
                  Ignorado (usando Claude)
                </span>
              )}
            </AtcCardHeader>
            <AtcCardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Modelos gratuitos disponíveis quando não há API Key Claude configurada
              </p>
              <Select
                value={localSettings.selectedModel}
                onValueChange={(value: LovableAIModel) => 
                  setLocalSettings(prev => ({ ...prev, selectedModel: value }))
                }
                disabled={!!localSettings.anthropicApiKey}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {LOVABLE_AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{model.label}</span>
                        <span className="text-[10px] text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AtcCardContent>
          </AtcCard>
        </div>

        {/* TTS Configuration */}
        <AtcCard>
          <AtcCardHeader>
            <Volume2 className="w-5 h-5 text-atc-cyan" />
            <AtcCardTitle>API Key ElevenLabs (TTS)</AtcCardTitle>
            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">OPCIONAL</span>
          </AtcCardHeader>
          <AtcCardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Para respostas em áudio do ATC. Obtenha em{' '}
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-atc-cyan hover:underline"
              >
                elevenlabs.io
              </a>
            </p>
            <div className="relative">
              <AtcInput
                type={showElevenLabs ? 'text' : 'password'}
                value={localSettings.elevenLabsApiKey || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, elevenLabsApiKey: e.target.value }))}
                placeholder="sua-chave-elevenlabs..."
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowElevenLabs(!showElevenLabs)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showElevenLabs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </AtcCardContent>
        </AtcCard>

        {/* OpenAI API Key (Whisper) */}
        <AtcCard>
          <AtcCardHeader>
            <Key className="w-5 h-5 text-primary" />
            <AtcCardTitle>API Key OpenAI (Whisper)</AtcCardTitle>
          </AtcCardHeader>
          <AtcCardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Utilizada para transcrição de áudio via Whisper API
            </p>
            <div className="relative">
              <AtcInput
                type={showOpenAI ? 'text' : 'password'}
                value={localSettings.openaiApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                placeholder="sk-..."
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </AtcCardContent>
        </AtcCard>

        {/* AVWX API Key */}
        <AtcCard>
          <AtcCardHeader>
            <Cloud className="w-5 h-5 text-atc-cyan" />
            <AtcCardTitle>API Key AVWX (METAR/TAF)</AtcCardTitle>
          </AtcCardHeader>
          <AtcCardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Utilizada para obter dados meteorológicos reais (METAR/TAF)
            </p>
            <div className="relative">
              <AtcInput
                type={showAVWX ? 'text' : 'password'}
                value={localSettings.avwxApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, avwxApiKey: e.target.value }))}
                placeholder="sua-chave-avwx..."
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowAVWX(!showAVWX)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAVWX ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Obtenha sua chave em{' '}
              <a 
                href="https://avwx.rest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-atc-cyan hover:underline"
              >
                avwx.rest
              </a>
            </p>
          </AtcCardContent>
        </AtcCard>

        {/* System Prompt */}
        <AtcCard>
          <AtcCardHeader>
            <FileText className="w-5 h-5 text-atc-green" />
            <AtcCardTitle>System Prompt</AtcCardTitle>
          </AtcCardHeader>
          <AtcCardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Instruções do sistema para o ATC Virtual (pode ser editado)
            </p>
            <Textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="min-h-[300px] font-mono text-xs bg-input border-border resize-y"
              placeholder="Digite o prompt do sistema..."
            />
          </AtcCardContent>
        </AtcCard>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <AtcButton onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </AtcButton>
        </div>
      </div>
    </div>
  );
}
