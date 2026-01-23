import { useRef, useState, useCallback, useEffect } from 'react';
import { Plane, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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

  const currentPhaseInfo = getFlightPhaseInfo(currentPhase);
  const currentPosition = currentPhaseInfo?.position ?? 0;

  // Navigation state
  const currentIndex = FLIGHT_PHASES.findIndex(p => p.id === currentPhase);
  const isFirstPhase = currentIndex === 0;
  const isLastPhase = currentIndex === FLIGHT_PHASES.length - 1;
  const nextPhase = !isLastPhase ? FLIGHT_PHASES[currentIndex + 1] : null;

  // Navigation functions
  const goToPreviousPhase = useCallback(() => {
    if (!isFirstPhase) {
      onChange(FLIGHT_PHASES[currentIndex - 1].id);
    }
  }, [currentIndex, isFirstPhase, onChange]);

  const goToNextPhase = useCallback(() => {
    if (!isLastPhase) {
      onChange(FLIGHT_PHASES[currentIndex + 1].id);
    }
  }, [currentIndex, isLastPhase, onChange]);

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

  // Color helpers
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

  const getPhaseTextColor = (phase: FlightPhaseInfo | undefined) => {
    if (!phase) return 'text-foreground';
    if (phase.silenceRequired) return 'text-destructive';
    if (phase.airport === 'departure') return 'text-atc-green';
    if (phase.airport === 'arrival') return 'text-atc-cyan';
    return 'text-atc-amber';
  };

  return (
    <div className="space-y-1 px-2">
      
      {/* === LINHA 1: Fase Atual === */}
      <div className={`text-center font-mono text-sm font-semibold ${getPhaseTextColor(currentPhaseInfo)}`}>
        <span className="text-lg mr-1.5">{currentPhaseInfo?.icon}</span>
        <span className="hidden xs:inline">{currentPhaseInfo?.label}</span>
        <span className="xs:hidden">{currentPhaseInfo?.shortLabel}</span>
      </div>

      {/* === LINHA 2: Próxima Fase === */}
      <div className="text-center text-xs text-muted-foreground">
        {nextPhase ? (
          <span className="flex items-center justify-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span className="text-base">{nextPhase.icon}</span>
            <span className="hidden xs:inline">{nextPhase.label}</span>
            <span className="xs:hidden">{nextPhase.shortLabel}</span>
          </span>
        ) : (
          <span>✓ Fim do Voo</span>
        )}
      </div>

      {/* === LINHA 3: Timeline com Setas nas Extremidades === */}
      <div className="flex items-center gap-1">
        
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={goToPreviousPhase}
          disabled={isFirstPhase}
          className="p-1.5 rounded-md bg-muted/50 hover:bg-muted 
                     disabled:opacity-30 disabled:cursor-not-allowed 
                     transition-colors shrink-0"
          aria-label="Fase anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Track draggável */}
        <div 
          ref={trackRef}
          className="relative flex-1 h-8 cursor-pointer select-none touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background track */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 
                          rounded-full bg-gradient-to-r from-atc-green/20 
                          via-atc-amber/20 to-atc-cyan/20" />
          
          {/* Progress track */}
          <div 
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full 
                       bg-gradient-to-r from-atc-green via-atc-amber to-atc-cyan 
                       transition-all duration-150"
            style={{ width: `${currentPosition}%` }}
          />

          {/* Phase markers */}
          {FLIGHT_PHASES.map((phase, index) => {
            const isPassed = index < currentIndex;
            const isActive = phase.id === currentPhase;
            
            return (
              <button
                key={phase.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhaseClick(phase.id);
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 
                            rounded-full transition-all duration-150
                            ${isActive 
                              ? 'w-3 h-3 ring-2 ring-offset-1 ring-offset-background' 
                              : 'w-2 h-2 hover:scale-125'
                            }
                            ${isPassed || isActive 
                              ? getPhaseColor(phase) 
                              : 'bg-muted-foreground/30'
                            }
                            ${isActive ? getPhaseRingColor(phase, true) : ''}
                            `}
                style={{ left: `${phase.position}%` }}
                title={phase.label}
              />
            );
          })}

          {/* Airplane indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 
                        transition-all duration-200 pointer-events-none
                        ${isDragging ? 'scale-110' : ''}`}
            style={{ left: `${currentPosition}%` }}
          >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full 
                             shadow-md border border-current/20
                             ${currentPhaseInfo?.silenceRequired 
                               ? 'bg-destructive/20 text-destructive' 
                               : currentPhaseInfo?.airport === 'departure'
                                 ? 'bg-atc-green/20 text-atc-green'
                                 : currentPhaseInfo?.airport === 'arrival'
                                   ? 'bg-atc-cyan/20 text-atc-cyan'
                                   : 'bg-atc-amber/20 text-atc-amber'
                             }`}>
              <Plane 
                className="w-3.5 h-3.5" 
                style={{ transform: currentPosition > 50 ? 'scaleX(-1)' : 'none' }} 
              />
            </div>
          </div>
        </div>

        {/* Botão Avançar */}
        <button
          type="button"
          onClick={goToNextPhase}
          disabled={isLastPhase}
          className="p-1.5 rounded-md bg-muted/50 hover:bg-muted 
                     disabled:opacity-30 disabled:cursor-not-allowed 
                     transition-colors shrink-0"
          aria-label="Próxima fase"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* === LINHA 4: Status === */}
      <div className="flex items-center justify-between text-[10px] 
                      font-mono text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          {currentPhaseInfo?.airport === 'departure' && (
            <span className="text-atc-green font-semibold">DEP</span>
          )}
          {currentPhaseInfo?.airport === 'arrival' && (
            <span className="text-atc-cyan font-semibold">ARR</span>
          )}
          {currentPhaseInfo?.airport === 'enroute' && (
            <span className="text-atc-amber font-semibold">ENR</span>
          )}
        </span>
        
        <span className={currentPhaseInfo?.silenceRequired ? 'text-destructive font-semibold' : ''}>
          {currentPhaseInfo?.silenceRequired 
            ? '🔇 Silêncio obrigatório'
            : `${flightType}: ${currentPhaseInfo?.expectedService[flightType].join(' → ')}`
          }
        </span>
      </div>
    </div>
  );
}
