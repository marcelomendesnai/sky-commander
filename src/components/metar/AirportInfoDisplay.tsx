import { MapPin, Radio, Plane, Info } from 'lucide-react';
import { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent } from '@/components/ui/atc-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AirportData } from '@/types/flight';

interface AirportInfoDisplayProps {
  airport: AirportData | null;
  label: string;
  color: 'green' | 'cyan';
}

export function AirportInfoDisplay({ airport, label, color }: AirportInfoDisplayProps) {
  const colorClasses = {
    green: 'text-atc-green border-atc-green/30',
    cyan: 'text-atc-cyan border-atc-cyan/30',
  };

  if (!airport) {
    return null;
  }

  return (
    <AtcCard className={`border-2 ${colorClasses[color]}`}>
      <AtcCardHeader>
        <MapPin className={`w-5 h-5 ${color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}`} />
        <AtcCardTitle className={color === 'green' ? 'text-atc-green' : 'text-atc-cyan'}>
          {label} - {airport.icao}
        </AtcCardTitle>
      </AtcCardHeader>
      <AtcCardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Nome</p>
            <p className="font-mono">{airport.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Cidade</p>
            <p className="font-mono">{airport.city || 'N/A'}, {airport.country || ''}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Elevação</p>
            <p className="font-mono">{airport.elevation} ft</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Coordenadas</p>
            <p className="font-mono text-xs">
              {airport.latitude.toFixed(4)}°, {airport.longitude.toFixed(4)}°
            </p>
          </div>
        </div>

        {/* Frequencies */}
        {airport.frequencies && airport.frequencies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">FREQUÊNCIAS</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Tipo</TableHead>
                    <TableHead className="text-xs py-2">Frequência</TableHead>
                    <TableHead className="text-xs py-2">Nome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airport.frequencies.map((freq, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs py-2">{freq.type}</TableCell>
                      <TableCell className="font-mono text-xs py-2 text-primary">{freq.frequency}</TableCell>
                      <TableCell className="text-xs py-2">{freq.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Runways */}
        {airport.runways && airport.runways.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">PISTAS</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Pista</TableHead>
                    <TableHead className="text-xs py-2">Comprimento</TableHead>
                    <TableHead className="text-xs py-2">Largura</TableHead>
                    <TableHead className="text-xs py-2">Superfície</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airport.runways.map((rwy, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs py-2 text-primary">{rwy.ident}</TableCell>
                      <TableCell className="font-mono text-xs py-2">{rwy.length.toLocaleString()} ft</TableCell>
                      <TableCell className="font-mono text-xs py-2">{rwy.width} ft</TableCell>
                      <TableCell className="text-xs py-2">{rwy.surface}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Regional Info */}
        {airport.regionalInfo && (
          <div className="flex items-start gap-2 p-3 bg-background/50 rounded border border-border">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{airport.regionalInfo}</p>
          </div>
        )}
      </AtcCardContent>
    </AtcCard>
  );
}
