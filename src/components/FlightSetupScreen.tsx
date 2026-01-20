import { useState } from 'react';
import { Plane, MapPin, Navigation, Target, AlertCircle, Loader2 } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { AtcInput } from '@/components/ui/atc-input';
import { AtcButton } from '@/components/ui/atc-button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

// Common ICAO codes for validation (simplified - in production would use API)
const validateICAO = async (icao: string, avwxApiKey: string): Promise<boolean> => {
  if (!avwxApiKey) {
    // Basic format validation if no API key
    return /^[A-Z]{4}$/.test(icao.toUpperCase());
  }
  
  try {
    const response = await fetch(`https://avwx.rest/api/station/${icao.toUpperCase()}`, {
      headers: { 'Authorization': `BEARER ${avwxApiKey}` }
    });
    return response.ok;
  } catch {
    return /^[A-Z]{4}$/.test(icao.toUpperCase());
  }
};

export function FlightSetupScreen() {
  const { settings, setFlightData, setCurrentScreen, setDepartureMetar, setArrivalMetar, setArrivalTaf } = useApp();
  
  const [aircraft, setAircraft] = useState('');
  const [departureIcao, setDepartureIcao] = useState('');
  const [arrivalIcao, setArrivalIcao] = useState('');
  const [flightType, setFlightType] = useState<'VFR' | 'IFR'>('VFR');
  const [mode, setMode] = useState<'TREINO' | 'REAL'>('TREINO');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchMetar = async (icao: string) => {
    if (!settings.avwxApiKey) return null;
    try {
      const response = await fetch(`https://avwx.rest/api/metar/${icao.toUpperCase()}`, {
        headers: { 'Authorization': `BEARER ${settings.avwxApiKey}` }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        icao: icao.toUpperCase(),
        raw: data.raw,
        temperature: data.temperature?.value,
        dewpoint: data.dewpoint?.value,
        wind_direction: data.wind_direction?.value,
        wind_speed: data.wind_speed?.value,
        wind_gust: data.wind_gust?.value,
        visibility: data.visibility?.value,
        altimeter: data.altimeter?.value,
        flight_rules: data.flight_rules,
        clouds: data.clouds?.map((c: any) => ({ type: c.type, altitude: c.altitude })),
        time: data.time?.repr,
      };
    } catch {
      return null;
    }
  };

  const fetchTaf = async (icao: string) => {
    if (!settings.avwxApiKey) return null;
    try {
      const response = await fetch(`https://avwx.rest/api/taf/${icao.toUpperCase()}`, {
        headers: { 'Authorization': `BEARER ${settings.avwxApiKey}` }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        icao: icao.toUpperCase(),
        raw: data.raw,
        time: data.time?.repr,
      };
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!aircraft.trim()) {
      newErrors.aircraft = 'Informe a aeronave';
    }
    
    if (!departureIcao.trim() || !/^[A-Za-z]{4}$/.test(departureIcao)) {
      newErrors.departureIcao = 'ICAO inválido (4 letras)';
    }
    
    if (!arrivalIcao.trim() || !/^[A-Za-z]{4}$/.test(arrivalIcao)) {
      newErrors.arrivalIcao = 'ICAO inválido (4 letras)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsValidating(true);
    setErrors({});

    try {
      // Validate ICAOs
      const [depValid, arrValid] = await Promise.all([
        validateICAO(departureIcao, settings.avwxApiKey),
        validateICAO(arrivalIcao, settings.avwxApiKey),
      ]);

      if (!depValid) {
        setErrors(prev => ({ ...prev, departureIcao: 'Aeródromo não encontrado' }));
        setIsValidating(false);
        return;
      }

      if (!arrValid) {
        setErrors(prev => ({ ...prev, arrivalIcao: 'Aeródromo não encontrado' }));
        setIsValidating(false);
        return;
      }

      // Fetch METAR/TAF data
      const [depMetar, arrMetar, arrTaf] = await Promise.all([
        fetchMetar(departureIcao),
        fetchMetar(arrivalIcao),
        fetchTaf(arrivalIcao),
      ]);

      setDepartureMetar(depMetar);
      setArrivalMetar(arrMetar);
      setArrivalTaf(arrTaf);

      setFlightData({
        aircraft: aircraft.toUpperCase(),
        departureIcao: departureIcao.toUpperCase(),
        arrivalIcao: arrivalIcao.toUpperCase(),
        flightType,
        mode,
      });

      toast.success('Dados do voo validados!');
      setCurrentScreen('metar');
    } catch (error) {
      toast.error('Erro ao validar dados. Verifique as configurações.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-mono font-bold text-primary mb-2">
          CONFIGURAÇÃO DO VOO
        </h2>
        <p className="text-sm text-muted-foreground">
          Informe os dados para iniciar o treinamento
        </p>
      </div>

      <AtcCard glow className="radar-grid relative">
        <div className="absolute inset-0 scanlines opacity-20" />
        <AtcCardContent className="relative z-10 space-y-6">
          {/* Aircraft */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Plane className="w-4 h-4" />
              <span>AERONAVE</span>
            </div>
            <AtcInput
              value={aircraft}
              onChange={(e) => setAircraft(e.target.value)}
              placeholder="Ex: C172, A320, B738..."
              error={errors.aircraft}
              valid={aircraft.length > 0 && !errors.aircraft}
            />
          </div>

          {/* Departure/Arrival */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <MapPin className="w-4 h-4 text-atc-green" />
                <span>SAÍDA (ICAO)</span>
              </div>
              <AtcInput
                value={departureIcao}
                onChange={(e) => setDepartureIcao(e.target.value.slice(0, 4))}
                placeholder="SBGR"
                maxLength={4}
                error={errors.departureIcao}
                valid={/^[A-Za-z]{4}$/.test(departureIcao) && !errors.departureIcao}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Target className="w-4 h-4 text-atc-cyan" />
                <span>CHEGADA (ICAO)</span>
              </div>
              <AtcInput
                value={arrivalIcao}
                onChange={(e) => setArrivalIcao(e.target.value.slice(0, 4))}
                placeholder="SBRJ"
                maxLength={4}
                error={errors.arrivalIcao}
                valid={/^[A-Za-z]{4}$/.test(arrivalIcao) && !errors.arrivalIcao}
              />
            </div>
          </div>

          {/* Flight Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>TIPO DE VOO</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AtcButton
                type="button"
                variant={flightType === 'VFR' ? 'success' : 'outline'}
                onClick={() => setFlightType('VFR')}
                className="w-full"
              >
                VFR
              </AtcButton>
              <AtcButton
                type="button"
                variant={flightType === 'IFR' ? 'default' : 'outline'}
                onClick={() => setFlightType('IFR')}
                className="w-full"
              >
                IFR
              </AtcButton>
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>MODO</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AtcButton
                type="button"
                variant={mode === 'TREINO' ? 'default' : 'outline'}
                onClick={() => setMode('TREINO')}
                className="w-full"
              >
                TREINO
              </AtcButton>
              <AtcButton
                type="button"
                variant={mode === 'REAL' ? 'default' : 'outline'}
                onClick={() => setMode('REAL')}
                className="w-full"
              >
                REAL
              </AtcButton>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {mode === 'TREINO' 
                ? 'Avaliações imediatas após cada comunicação'
                : 'Avaliações apenas no debriefing final'
              }
            </p>
          </div>

          {/* Submit */}
          <AtcButton
            onClick={handleSubmit}
            disabled={isValidating}
            className="w-full mt-6"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : (
              'INICIAR VOO'
            )}
          </AtcButton>
        </AtcCardContent>
      </AtcCard>
    </div>
  );
}
