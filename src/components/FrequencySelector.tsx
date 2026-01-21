import { Radio, Plane, PlaneLanding } from 'lucide-react';
import type { AirportData, SelectedFrequency, FrequencyType } from '@/types/flight';
import { DEPARTURE_FREQUENCY_ORDER, ARRIVAL_FREQUENCY_ORDER } from '@/types/flight';

interface FrequencySelectorProps {
  departureAirport: AirportData | null;
  arrivalAirport: AirportData | null;
  selectedFrequency: SelectedFrequency | null;
  onChange: (frequency: SelectedFrequency | null) => void;
}

// Map frequency types to display labels
const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  ATIS: 'ATIS',
  CLR: 'CLR',
  GND: 'SOLO',
  TWR: 'TORRE',
  APP: 'APP',
  DEP: 'DEP',
  CTR: 'CTR',
};

// Map API frequency types to our FrequencyType
const mapFrequencyType = (type: string): FrequencyType | null => {
  const upperType = type.toUpperCase();
  if (upperType.includes('ATIS')) return 'ATIS';
  if (upperType.includes('CLR') || upperType.includes('CLEARANCE')) return 'CLR';
  if (upperType.includes('GND') || upperType.includes('GROUND') || upperType.includes('SOLO')) return 'GND';
  if (upperType.includes('TWR') || upperType.includes('TOWER') || upperType.includes('TORRE')) return 'TWR';
  if (upperType.includes('APP') || upperType.includes('APPROACH') || upperType.includes('APROX')) return 'APP';
  if (upperType.includes('DEP') || upperType.includes('DEPARTURE')) return 'DEP';
  if (upperType.includes('CTR') || upperType.includes('CENTER') || upperType.includes('CONTROLE')) return 'CTR';
  return null;
};

export function FrequencySelector({
  departureAirport,
  arrivalAirport,
  selectedFrequency,
  onChange,
}: FrequencySelectorProps) {
  const selectedAirportType = selectedFrequency?.airport || 'departure';
  const currentAirport = selectedAirportType === 'departure' ? departureAirport : arrivalAirport;
  const frequencyOrder = selectedAirportType === 'departure' ? DEPARTURE_FREQUENCY_ORDER : ARRIVAL_FREQUENCY_ORDER;

  // Get available frequencies from airport data, organized by type
  const getFrequenciesMap = (airport: AirportData | null): Map<FrequencyType, { frequency: string; name: string }> => {
    const map = new Map<FrequencyType, { frequency: string; name: string }>();
    if (!airport?.frequencies) return map;

    airport.frequencies.forEach((freq) => {
      const freqType = mapFrequencyType(freq.type);
      if (freqType && !map.has(freqType)) {
        map.set(freqType, { frequency: freq.frequency, name: freq.name || freq.type });
      }
    });

    return map;
  };

  const frequenciesMap = getFrequenciesMap(currentAirport);

  const handleAirportChange = (airport: 'departure' | 'arrival') => {
    if (airport === selectedAirportType) return;
    // Reset selection when changing airport
    onChange(null);
  };

  const handleFrequencySelect = (freqType: FrequencyType) => {
    const freqData = frequenciesMap.get(freqType);
    if (!freqData) return;

    onChange({
      airport: selectedAirportType,
      frequencyType: freqType,
      frequency: freqData.frequency,
      name: freqData.name,
    });
  };

  if (!departureAirport && !arrivalAirport) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Airport selector row */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">Sintonizado:</span>
        <div className="flex items-center gap-1 flex-1">
          {departureAirport && (
            <button
              type="button"
              onClick={() => handleAirportChange('departure')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                selectedAirportType === 'departure'
                  ? 'bg-atc-green/20 text-atc-green border border-atc-green/40'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Plane className="w-3 h-3" />
              <span>{departureAirport.icao}</span>
            </button>
          )}
          {arrivalAirport && (
            <button
              type="button"
              onClick={() => handleAirportChange('arrival')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                selectedAirportType === 'arrival'
                  ? 'bg-atc-cyan/20 text-atc-cyan border border-atc-cyan/40'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <PlaneLanding className="w-3 h-3" />
              <span>{arrivalAirport.icao}</span>
            </button>
          )}
        </div>
      </div>

      {/* Frequency selector row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {frequencyOrder.map((freqType) => {
          const freqData = frequenciesMap.get(freqType);
          const isAvailable = !!freqData;
          const isSelected = selectedFrequency?.frequencyType === freqType && selectedFrequency?.airport === selectedAirportType;

          return (
            <button
              key={freqType}
              type="button"
              onClick={() => isAvailable && handleFrequencySelect(freqType)}
              disabled={!isAvailable}
              className={`flex flex-col items-center px-2.5 py-1.5 rounded text-xs font-mono transition-all min-w-[52px] ${
                isSelected
                  ? 'bg-atc-amber/25 text-atc-amber border border-atc-amber/50 shadow-sm shadow-atc-amber/20'
                  : isAvailable
                  ? 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                  : 'bg-muted/20 text-muted-foreground/40 cursor-not-allowed border border-transparent'
              }`}
              title={freqData ? `${freqData.name}: ${freqData.frequency}` : 'Frequência não disponível'}
            >
              <span className="font-semibold">{FREQUENCY_LABELS[freqType]}</span>
              {freqData && (
                <span className={`text-[9px] ${isSelected ? 'text-atc-amber/80' : 'text-muted-foreground/60'}`}>
                  {freqData.frequency}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected frequency indicator */}
      {selectedFrequency && (
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-atc-amber/10 border border-atc-amber/20">
          <Radio className="w-3 h-3 text-atc-amber animate-pulse" />
          <span className="text-xs font-mono text-atc-amber">
            {currentAirport?.icao} {FREQUENCY_LABELS[selectedFrequency.frequencyType]} - {selectedFrequency.frequency}
          </span>
        </div>
      )}
    </div>
  );
}
