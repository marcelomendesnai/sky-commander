import { Cloud } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import type { TafData } from '@/types/flight';

interface TafDisplayProps {
  taf: TafData | null;
}

export function TafDisplay({ taf }: TafDisplayProps) {
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
