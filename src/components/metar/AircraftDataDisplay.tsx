import { Plane, Gauge, ArrowUp } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { findAircraft } from '@/data/aircraftDatabase';
import type { AircraftData } from '@/types/flight';

interface AircraftDataDisplayProps {
  aircraftIdentifier: string;
}

function SpeedRow({ label, speeds }: { label: string; speeds?: { loaded: number; light: number } }) {
  if (!speeds) return null;
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <div className="flex gap-4">
        <span className="text-xs font-mono">
          <span className="text-muted-foreground">L:</span>{' '}
          <span className="text-primary">{speeds.loaded}kt</span>
        </span>
        <span className="text-xs font-mono">
          <span className="text-muted-foreground">U:</span>{' '}
          <span className="text-atc-green">{speeds.light}kt</span>
        </span>
      </div>
    </div>
  );
}

export function AircraftDataDisplay({ aircraftIdentifier }: AircraftDataDisplayProps) {
  const aircraft = findAircraft(aircraftIdentifier);

  if (!aircraft) {
    return (
      <AtcCard className="border-2 border-border">
        <AtcCardHeader>
          <Plane className="w-5 h-5 text-muted-foreground" />
          <AtcCardTitle className="text-muted-foreground">AERONAVE</AtcCardTitle>
        </AtcCardHeader>
        <AtcCardContent>
          <p className="text-sm text-muted-foreground">
            Dados da aeronave "{aircraftIdentifier}" não encontrados na base de dados.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Aeronaves suportadas: C152, C172, C182, C206, C208, PA28, PA34, SR22, DA40, DA42, 
            B350, C90, PC12, TBM9, ATR42, ATR72, E170, E175, E190, E195, CRJ700, CRJ900,
            A318, A319, A320, A321, A220, A330, A340, A350, A380, 
            B737, B738, B739, B757, B767, B777, B787, B747
          </p>
        </AtcCardContent>
      </AtcCard>
    );
  }

  const typeLabels: Record<AircraftData['type'], string> = {
    single: 'Monomotor Pistão',
    multi: 'Bimotor Pistão',
    turboprop: 'Turboélice',
    jet: 'Jato',
  };

  return (
    <AtcCard className="border-2 border-primary/30">
      <AtcCardHeader>
        <Plane className="w-5 h-5 text-primary" />
        <AtcCardTitle className="text-primary">
          {aircraft.manufacturer} {aircraft.model}
        </AtcCardTitle>
        <span className="ml-auto text-xs font-mono px-2 py-1 rounded bg-primary/20 text-primary">
          {typeLabels[aircraft.type]}
        </span>
      </AtcCardHeader>
      <AtcCardContent className="space-y-4">
        {/* Speed Reference */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">VELOCIDADES DE REFERÊNCIA</span>
            <span className="text-[10px] text-muted-foreground/70 ml-auto">L=Carregado U=Leve</span>
          </div>
          <div className="bg-background/50 rounded border border-border p-3">
            <SpeedRow label="V1 (Decisão)" speeds={aircraft.speeds.v1} />
            <SpeedRow label="Vr (Rotação)" speeds={aircraft.speeds.vr} />
            <SpeedRow label="V2 (Segurança)" speeds={aircraft.speeds.v2} />
            <SpeedRow label="Vref (Aprox.)" speeds={aircraft.speeds.vref} />
            <SpeedRow label="Cruise" speeds={aircraft.speeds.cruise} />
          </div>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-2 gap-4">
          {aircraft.ceiling && (
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Teto</p>
                <p className="font-mono text-sm">{aircraft.ceiling.toLocaleString()} ft</p>
              </div>
            </div>
          )}
          {aircraft.range && (
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Alcance</p>
                <p className="font-mono text-sm">{aircraft.range.toLocaleString()} nm</p>
              </div>
            </div>
          )}
        </div>
      </AtcCardContent>
    </AtcCard>
  );
}
