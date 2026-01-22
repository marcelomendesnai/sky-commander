import { useRef, useState, useCallback, useEffect } from 'react';
import { Plane } from 'lucide-react';
import type { FlightPhase, FlightPhaseInfo } from '@/types/flight';
import { FLIGHT_PHASES, getFlightPhaseInfo } from '@/types/flight';

interface FlightTimelineProps {
  currentPhase: FlightPhase;
  onChange: (phase: FlightPhase) => void;
  flightType: 'VFR' | 'IFR';
}

export function FlightTimeline({ currentPhase, onChange, flightType }: FlightTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPhase, setHoveredPhase] = useState<FlightPhaseInfo | null>(null);

  const currentPhaseInfo = getFlightPhaseInfo(currentPhase);
  const currentPosition = currentPhaseInfo?.position ?? 0;

  // Calculate position from mouse/touch event
  const getPositionFromEvent = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percentage;
  }, []);

  // Find closest phase to a position
  const findClosestPhase = useCallback((position: number): FlightPhase => {
    let closest = FLIGHT_PHASES[0];
    let minDiff = Math.abs(FLIGHT_PHASES[0].position - position);

    for (const phase of FLIGHT_PHASES) {
      const diff = Math.abs(phase.position - position);
      if (diff < minDiff) {
        minDiff = diff;
        closest = phase;
      }
    }

    return closest.id;
  }, []);

  // Handle drag
  const handleDrag = useCallback((clientX: number) => {
    const position = getPositionFromEvent(clientX);
    const newPhase = findClosestPhase(position);
    if (newPhase !== currentPhase) {
      onChange(newPhase);
    }
  }, [currentPhase, findClosestPhase, getPositionFromEvent, onChange]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientX);
  }, [handleDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleDrag(e.clientX);
    }
  }, [isDragging, handleDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  }, [handleDrag]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      handleDrag(e.touches[0].clientX);
    }
  }, [isDragging, handleDrag]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click on phase marker
  const handlePhaseClick = useCallback((phase: FlightPhase) => {
    onChange(phase);
  }, [onChange]);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get color based on phase properties
  const getPhaseColor = (phase: FlightPhaseInfo) => {
    if (phase.silenceRequired) return 'bg-destructive/60';
    if (!phase.communicationAllowed) return 'bg-muted-foreground/40';
    if (phase.airport === 'departure') return 'bg-atc-green/60';
    if (phase.airport === 'arrival') return 'bg-atc-cyan/60';
    return 'bg-atc-amber/60';
  };

  const getPhaseRingColor = (phase: FlightPhaseInfo, isActive: boolean) => {
    if (isActive) {
      if (phase.silenceRequired) return 'ring-destructive';
      if (phase.airport === 'departure') return 'ring-atc-green';
      if (phase.airport === 'arrival') return 'ring-atc-cyan';
      return 'ring-atc-amber';
    }
    return 'ring-transparent';
  };

  return (
    <div className="space-y-2 px-2">
      {/* Current phase indicator */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">Fase do Voo:</span>
        <span className={`font-semibold ${
          currentPhaseInfo?.silenceRequired 
            ? 'text-destructive' 
            : currentPhaseInfo?.airport === 'departure' 
              ? 'text-atc-green' 
              : currentPhaseInfo?.airport === 'arrival'
                ? 'text-atc-cyan'
                : 'text-atc-amber'
        }`}>
          {currentPhaseInfo?.icon} {currentPhaseInfo?.label}
        </span>
      </div>

      {/* Timeline track */}
      <div 
        ref={trackRef}
        className="relative h-10 cursor-pointer select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background track with gradient */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-atc-green/30 via-atc-amber/30 to-atc-cyan/30" />
        
        {/* Progress track */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-atc-green via-atc-amber to-atc-cyan transition-all duration-150"
          style={{ width: `${currentPosition}%` }}
        />

        {/* Phase markers */}
        {FLIGHT_PHASES.map((phase) => {
          const isActive = phase.id === currentPhase;
          const isHovered = hoveredPhase?.id === phase.id;
          
          return (
            <button
              key={phase.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePhaseClick(phase.id);
              }}
              onMouseEnter={() => setHoveredPhase(phase)}
              onMouseLeave={() => setHoveredPhase(null)}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-all duration-150 ${getPhaseColor(phase)} ${
                isActive 
                  ? `scale-150 ring-2 ${getPhaseRingColor(phase, true)} shadow-lg` 
                  : isHovered 
                    ? 'scale-125 ring-1 ring-foreground/30' 
                    : ''
              }`}
              style={{ left: `${phase.position}%` }}
              title={phase.label}
            />
          );
        })}

        {/* Airplane indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-200 ${
            isDragging ? 'scale-125' : ''
          }`}
          style={{ left: `${currentPosition}%` }}
        >
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
            currentPhaseInfo?.silenceRequired 
              ? 'bg-destructive/20 text-destructive' 
              : currentPhaseInfo?.airport === 'departure'
                ? 'bg-atc-green/20 text-atc-green'
                : currentPhaseInfo?.airport === 'arrival'
                  ? 'bg-atc-cyan/20 text-atc-cyan'
                  : 'bg-atc-amber/20 text-atc-amber'
          } shadow-lg border border-current/30`}>
            <Plane className="w-4 h-4" style={{ transform: currentPosition > 50 ? 'scaleX(-1)' : 'none' }} />
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredPhase && (
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>{hoveredPhase.icon} {hoveredPhase.shortLabel}</span>
          <span className={hoveredPhase.silenceRequired ? 'text-destructive' : ''}>
            {hoveredPhase.silenceRequired 
              ? '⚠️ Silêncio' 
              : hoveredPhase.expectedServiceHint || `Serviço: ${hoveredPhase.expectedService[flightType].join('/')}`
            }
          </span>
        </div>
      )}

      {/* Phase hint when not hovering */}
      {!hoveredPhase && currentPhaseInfo && (
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            {currentPhaseInfo.airport === 'departure' && <span className="text-atc-green">DEP</span>}
            {currentPhaseInfo.airport === 'arrival' && <span className="text-atc-cyan">ARR</span>}
            {currentPhaseInfo.airport === 'enroute' && <span className="text-atc-amber">ENR</span>}
          </span>
          <span className={currentPhaseInfo.silenceRequired ? 'text-destructive' : ''}>
            {currentPhaseInfo.silenceRequired 
              ? '🔇 ' + (currentPhaseInfo.silenceMessage?.split('.')[0] || 'Silêncio obrigatório')
              : currentPhaseInfo.expectedServiceHint || `${flightType}: ${currentPhaseInfo.expectedService[flightType].join(' → ')}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
