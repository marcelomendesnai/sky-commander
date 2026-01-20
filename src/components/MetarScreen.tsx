import { Cloud, Wind, Thermometer, Eye, Gauge, ArrowRight, ChevronDown } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import type { MetarData, TafData } from '@/types/flight';

function MetarDisplay({ metar, label, color }: { metar: MetarData | null; label: string; color: 'green' | 'cyan' }) {
  const colorClasses = {
    green: 'text-atc-green border-atc-green/30',
    cyan: 'text-atc-cyan border-atc-cyan/30',
  };

  if (!metar) {
    return (
      <AtcCard className={`border-2 ${colorClasses[color]}`}>
        <AtcCardHeader>
          <Cloud className={`w-5 h-5 ${color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}`} />
          <AtcCardTitle className={color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}>
            {label}
          </AtcCardTitle>
        </AtcCardHeader>
        <AtcCardContent>
          <p className="text-sm text-muted-foreground">
            METAR não disponível. Configure a API Key AVWX nas configurações.
          </p>
        </AtcCardContent>
      </AtcCard>
    );
  }

  return (
    <AtcCard className={`border-2 ${colorClasses[color]}`}>
      <AtcCardHeader>
        <Cloud className={`w-5 h-5 ${color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}`} />
        <AtcCardTitle className={color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}>
          METAR {metar.icao}
        </AtcCardTitle>
        {metar.flight_rules && (
          <span className={`ml-auto text-xs font-mono px-2 py-1 rounded ${
            metar.flight_rules === 'VFR' ? 'bg-atc-green/20 text-atc-green' :
            metar.flight_rules === 'MVFR' ? 'bg-atc-amber/20 text-atc-amber' :
            metar.flight_rules === 'IFR' ? 'bg-atc-red/20 text-atc-red' :
            'bg-destructive/20 text-destructive'
          }`}>
            {metar.flight_rules}
          </span>
        )}
      </AtcCardHeader>
      <AtcCardContent>
        {/* Raw METAR */}
        <div className="metar-display p-3 bg-background/50 rounded border border-border overflow-x-auto">
          {metar.raw}
        </div>

        {/* Decoded Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {metar.wind_direction !== undefined && metar.wind_speed !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Wind className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">
                {String(metar.wind_direction).padStart(3, '0')}° / {metar.wind_speed}kt
                {metar.wind_gust && ` G${metar.wind_gust}`}
              </span>
            </div>
          )}
          {metar.visibility !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">
                {metar.visibility >= 9999 ? '10km+' : `${(metar.visibility / 1000).toFixed(1)}km`}
              </span>
            </div>
          )}
          {metar.temperature !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Thermometer className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">
                {metar.temperature}°C / {metar.dewpoint}°C
              </span>
            </div>
          )}
          {metar.altimeter !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-primary">
                QNH {Math.round(metar.altimeter)}
              </span>
            </div>
          )}
        </div>

        {/* Clouds */}
        {metar.clouds && metar.clouds.length > 0 && (
          <div className="mt-3 text-xs font-mono text-muted-foreground">
            <span className="mr-2">Nuvens:</span>
            {metar.clouds.map((c, i) => (
              <span key={i} className="mr-2">
                {c.type} {c.altitude * 100}ft
              </span>
            ))}
          </div>
        )}

        {metar.time && (
          <p className="text-[10px] text-muted-foreground mt-3">
            Observação: {metar.time}Z
          </p>
        )}
      </AtcCardContent>
    </AtcCard>
  );
}

function TafDisplay({ taf }: { taf: TafData | null }) {
  if (!taf) {
    return (
      <AtcCard className="border-2 border-atc-amber/30">
        <AtcCardHeader>
          <Cloud className="w-5 h-5 text-atc-amber" />
          <AtcCardTitle className="text-atc-amber">TAF (PREVISÃO)</AtcCardTitle>
        </AtcCardHeader>
        <AtcCardContent>
          <p className="text-sm text-muted-foreground">
            TAF não disponível.
          </p>
        </AtcCardContent>
      </AtcCard>
    );
  }

  return (
    <AtcCard className="border-2 border-atc-amber/30">
      <AtcCardHeader>
        <Cloud className="w-5 h-5 text-atc-amber" />
        <AtcCardTitle className="text-atc-amber">TAF {taf.icao}</AtcCardTitle>
      </AtcCardHeader>
      <AtcCardContent>
        <div className="metar-display p-3 bg-background/50 rounded border border-border overflow-x-auto whitespace-pre-wrap">
          {taf.raw}
        </div>
        {taf.time && (
          <p className="text-[10px] text-muted-foreground mt-3">
            Emitido: {taf.time}Z
          </p>
        )}
      </AtcCardContent>
    </AtcCard>
  );
}

export function MetarScreen() {
  const { flightData, departureMetar, arrivalMetar, arrivalTaf, setCurrentScreen, addMessage } = useApp();

  const handleStartChat = () => {
    // Add initial system message
    addMessage({
      role: 'system',
      content: `Voo iniciado: ${flightData?.aircraft} | ${flightData?.departureIcao} → ${flightData?.arrivalIcao} | ${flightData?.flightType} | Modo ${flightData?.mode}`,
    });
    setCurrentScreen('chat');
  };

  if (!flightData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="text-center">
          <span className="text-3xl font-mono font-bold text-atc-green">
            {flightData.departureIcao}
          </span>
          <p className="text-xs text-muted-foreground uppercase">Partida</p>
        </div>
        <ArrowRight className="w-8 h-8 text-primary" />
        <div className="text-center">
          <span className="text-3xl font-mono font-bold text-atc-cyan">
            {flightData.arrivalIcao}
          </span>
          <p className="text-xs text-muted-foreground uppercase">Chegada</p>
        </div>
      </div>

      {/* METAR Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <MetarDisplay metar={departureMetar} label="METAR PARTIDA" color="green" />
        <MetarDisplay metar={arrivalMetar} label="METAR CHEGADA" color="cyan" />
      </div>

      {/* TAF */}
      <TafDisplay taf={arrivalTaf} />

      {/* Continue Button */}
      <div className="mt-8 flex justify-center">
        <AtcButton onClick={handleStartChat} size="lg" className="gap-3">
          <ChevronDown className="w-5 h-5" />
          INICIAR COMUNICAÇÃO
        </AtcButton>
      </div>
    </div>
  );
}
