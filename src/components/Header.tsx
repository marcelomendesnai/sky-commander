import { Radio, Settings, RotateCcw, Plane } from 'lucide-react';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';

export function Header() {
  const { currentScreen, setCurrentScreen, startNewFlight, flightData } = useApp();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-atc-green rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold tracking-wider text-primary">
              ATC VIRTUAL
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Sistema de Treinamento
            </p>
          </div>
        </div>

        {/* Current Flight Info */}
        {flightData && currentScreen !== 'settings' && (
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plane className="w-4 h-4 text-primary" />
              <span className="text-foreground">{flightData.aircraft}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-atc-green">{flightData.departureIcao}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-atc-cyan">{flightData.arrivalIcao}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className={flightData.flightType === 'IFR' ? 'text-atc-amber' : 'text-atc-green'}>
              {flightData.flightType}
            </span>
            <span className={flightData.mode === 'TREINO' ? 'text-atc-cyan' : 'text-atc-amber'}>
              {flightData.mode}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentScreen !== 'flight-setup' && currentScreen !== 'settings' && (
            <AtcButton
              variant="outline"
              size="sm"
              onClick={startNewFlight}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Voo</span>
            </AtcButton>
          )}
          <AtcButton
            variant={currentScreen === 'settings' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setCurrentScreen(currentScreen === 'settings' ? 'flight-setup' : 'settings')}
          >
            <Settings className="w-4 h-4" />
          </AtcButton>
        </div>
      </div>
    </header>
  );
}
