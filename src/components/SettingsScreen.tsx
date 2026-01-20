import { useState } from 'react';
import { Key, Cloud, FileText, Save, Eye, EyeOff } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { AtcInput } from '@/components/ui/atc-input';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function SettingsScreen() {
  const { settings, updateSettings, setCurrentScreen } = useApp();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAVWX, setShowAVWX] = useState(false);
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
        {/* OpenAI API Key */}
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
