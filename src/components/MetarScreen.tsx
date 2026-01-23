import { ArrowRight, ChevronDown } from 'lucide-react';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import { MetarDisplay } from '@/components/metar/MetarDisplay';
import { TafDisplay } from '@/components/metar/TafDisplay';
import { AirportInfoDisplay } from '@/components/metar/AirportInfoDisplay';
import { AircraftDataDisplay } from '@/components/metar/AircraftDataDisplay';

export function MetarScreen() {
  const { 
    flightData, 
    departureMetar, 
    arrivalMetar, 
    arrivalTaf, 
    departureAirport,
    arrivalAirport,
    setCurrentScreen, 
    addMessage 
  } = useApp();

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
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
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

      {/* Aircraft Data */}
      <div className="mb-6">
        <AircraftDataDisplay aircraftIdentifier={flightData.aircraft} />
      </div>

      {/* METAR Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <MetarDisplay metar={departureMetar} label="METAR PARTIDA" color="green" />
        <MetarDisplay metar={arrivalMetar} label="METAR CHEGADA" color="cyan" />
      </div>

      {/* TAF */}
      <div className="mb-6">
        <TafDisplay taf={arrivalTaf} />
      </div>

      {/* Airport Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <AirportInfoDisplay airport={departureAirport} label="AEROPORTO PARTIDA" color="green" />
        <AirportInfoDisplay airport={arrivalAirport} label="AEROPORTO CHEGADA" color="cyan" />
      </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <AtcButton onClick={handleStartChat} size="lg" className="gap-3">
            <ChevronDown className="w-5 h-5" />
            INICIAR COMUNICAÇÃO
          </AtcButton>
        </div>
      </div>
    </div>
  );
}
