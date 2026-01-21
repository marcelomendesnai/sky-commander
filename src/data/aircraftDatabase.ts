import type { AircraftData } from '@/types/flight';

/**
 * Database of common aircraft with their performance data
 * Speeds are in knots (kt)
 * V1: Decision speed
 * Vr: Rotation speed
 * V2: Takeoff safety speed
 * Vref: Reference landing speed
 * Cruise: Cruise speed
 */
export const aircraftDatabase: AircraftData[] = [
  // Single Engine Piston
  {
    model: 'C150',
    manufacturer: 'Cessna',
    type: 'single',
    speeds: {
      vr: { loaded: 55, light: 50 },
      vref: { loaded: 60, light: 55 },
      cruise: { loaded: 95, light: 100 },
    },
    ceiling: 14000,
    range: 350,
  },
  {
    model: 'C152',
    manufacturer: 'Cessna',
    type: 'single',
    speeds: {
      vr: { loaded: 55, light: 50 },
      vref: { loaded: 60, light: 55 },
      cruise: { loaded: 100, light: 105 },
    },
    ceiling: 14700,
    range: 415,
  },
  {
    model: 'C172',
    manufacturer: 'Cessna',
    type: 'single',
    speeds: {
      vr: { loaded: 55, light: 51 },
      vref: { loaded: 65, light: 60 },
      cruise: { loaded: 120, light: 125 },
    },
    ceiling: 13500,
    range: 640,
  },
  {
    model: 'C182',
    manufacturer: 'Cessna',
    type: 'single',
    speeds: {
      vr: { loaded: 56, light: 51 },
      vref: { loaded: 70, light: 65 },
      cruise: { loaded: 145, light: 150 },
    },
    ceiling: 18100,
    range: 930,
  },
  {
    model: 'C206',
    manufacturer: 'Cessna',
    type: 'single',
    speeds: {
      vr: { loaded: 62, light: 55 },
      vref: { loaded: 75, light: 68 },
      cruise: { loaded: 150, light: 158 },
    },
    ceiling: 15700,
    range: 810,
  },
  {
    model: 'C208',
    manufacturer: 'Cessna',
    type: 'turboprop',
    speeds: {
      vr: { loaded: 80, light: 70 },
      vref: { loaded: 85, light: 75 },
      cruise: { loaded: 186, light: 195 },
    },
    ceiling: 25000,
    range: 1070,
  },
  {
    model: 'PA28',
    manufacturer: 'Piper',
    type: 'single',
    speeds: {
      vr: { loaded: 60, light: 55 },
      vref: { loaded: 66, light: 61 },
      cruise: { loaded: 120, light: 125 },
    },
    ceiling: 11000,
    range: 465,
  },
  {
    model: 'PA34',
    manufacturer: 'Piper',
    type: 'multi',
    speeds: {
      v1: { loaded: 88, light: 82 },
      vr: { loaded: 85, light: 80 },
      v2: { loaded: 95, light: 90 },
      vref: { loaded: 91, light: 85 },
      cruise: { loaded: 170, light: 180 },
    },
    ceiling: 16000,
    range: 810,
  },
  {
    model: 'SR22',
    manufacturer: 'Cirrus',
    type: 'single',
    speeds: {
      vr: { loaded: 73, light: 68 },
      vref: { loaded: 78, light: 72 },
      cruise: { loaded: 180, light: 185 },
    },
    ceiling: 17500,
    range: 1050,
  },
  {
    model: 'DA40',
    manufacturer: 'Diamond',
    type: 'single',
    speeds: {
      vr: { loaded: 59, light: 54 },
      vref: { loaded: 67, light: 62 },
      cruise: { loaded: 140, light: 145 },
    },
    ceiling: 16400,
    range: 720,
  },
  {
    model: 'DA42',
    manufacturer: 'Diamond',
    type: 'multi',
    speeds: {
      v1: { loaded: 78, light: 72 },
      vr: { loaded: 76, light: 70 },
      v2: { loaded: 85, light: 80 },
      vref: { loaded: 82, light: 76 },
      cruise: { loaded: 175, light: 182 },
    },
    ceiling: 18000,
    range: 1100,
  },
  
  // Turboprops
  {
    model: 'B350',
    manufacturer: 'Beechcraft',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 107, light: 98 },
      vr: { loaded: 105, light: 96 },
      v2: { loaded: 120, light: 110 },
      vref: { loaded: 103, light: 95 },
      cruise: { loaded: 312, light: 320 },
    },
    ceiling: 35000,
    range: 1806,
  },
  {
    model: 'C90',
    manufacturer: 'Beechcraft',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 96, light: 88 },
      vr: { loaded: 94, light: 86 },
      v2: { loaded: 108, light: 100 },
      vref: { loaded: 95, light: 87 },
      cruise: { loaded: 226, light: 235 },
    },
    ceiling: 30000,
    range: 1260,
  },
  {
    model: 'PC12',
    manufacturer: 'Pilatus',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 100, light: 90 },
      vr: { loaded: 98, light: 88 },
      v2: { loaded: 110, light: 100 },
      vref: { loaded: 85, light: 78 },
      cruise: { loaded: 280, light: 290 },
    },
    ceiling: 30000,
    range: 1803,
  },
  {
    model: 'TBM9',
    manufacturer: 'Daher',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 100, light: 92 },
      vr: { loaded: 95, light: 88 },
      v2: { loaded: 105, light: 98 },
      vref: { loaded: 85, light: 78 },
      cruise: { loaded: 330, light: 340 },
    },
    ceiling: 31000,
    range: 1730,
  },
  {
    model: 'ATR42',
    manufacturer: 'ATR',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 115, light: 105 },
      vr: { loaded: 113, light: 103 },
      v2: { loaded: 125, light: 115 },
      vref: { loaded: 108, light: 98 },
      cruise: { loaded: 300, light: 310 },
    },
    ceiling: 25000,
    range: 800,
  },
  {
    model: 'ATR72',
    manufacturer: 'ATR',
    type: 'turboprop',
    speeds: {
      v1: { loaded: 120, light: 108 },
      vr: { loaded: 118, light: 106 },
      v2: { loaded: 130, light: 118 },
      vref: { loaded: 115, light: 105 },
      cruise: { loaded: 275, light: 285 },
    },
    ceiling: 25000,
    range: 900,
  },
  
  // Regional Jets
  {
    model: 'E170',
    manufacturer: 'Embraer',
    type: 'jet',
    speeds: {
      v1: { loaded: 138, light: 125 },
      vr: { loaded: 140, light: 127 },
      v2: { loaded: 150, light: 137 },
      vref: { loaded: 131, light: 118 },
      cruise: { loaded: 470, light: 480 },
    },
    ceiling: 41000,
    range: 2150,
  },
  {
    model: 'E175',
    manufacturer: 'Embraer',
    type: 'jet',
    speeds: {
      v1: { loaded: 140, light: 127 },
      vr: { loaded: 142, light: 129 },
      v2: { loaded: 152, light: 139 },
      vref: { loaded: 133, light: 120 },
      cruise: { loaded: 470, light: 480 },
    },
    ceiling: 41000,
    range: 2200,
  },
  {
    model: 'E190',
    manufacturer: 'Embraer',
    type: 'jet',
    speeds: {
      v1: { loaded: 145, light: 130 },
      vr: { loaded: 147, light: 132 },
      v2: { loaded: 157, light: 142 },
      vref: { loaded: 138, light: 123 },
      cruise: { loaded: 470, light: 481 },
    },
    ceiling: 41000,
    range: 2850,
  },
  {
    model: 'E195',
    manufacturer: 'Embraer',
    type: 'jet',
    speeds: {
      v1: { loaded: 147, light: 132 },
      vr: { loaded: 149, light: 134 },
      v2: { loaded: 159, light: 144 },
      vref: { loaded: 140, light: 125 },
      cruise: { loaded: 470, light: 481 },
    },
    ceiling: 41000,
    range: 2600,
  },
  {
    model: 'CRJ700',
    manufacturer: 'Bombardier',
    type: 'jet',
    speeds: {
      v1: { loaded: 142, light: 128 },
      vr: { loaded: 144, light: 130 },
      v2: { loaded: 154, light: 140 },
      vref: { loaded: 135, light: 121 },
      cruise: { loaded: 473, light: 485 },
    },
    ceiling: 41000,
    range: 1430,
  },
  {
    model: 'CRJ900',
    manufacturer: 'Bombardier',
    type: 'jet',
    speeds: {
      v1: { loaded: 145, light: 130 },
      vr: { loaded: 147, light: 132 },
      v2: { loaded: 157, light: 142 },
      vref: { loaded: 138, light: 123 },
      cruise: { loaded: 475, light: 487 },
    },
    ceiling: 41000,
    range: 1550,
  },
  
  // Narrow Body Jets
  {
    model: 'A318',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 145, light: 130 },
      vr: { loaded: 150, light: 135 },
      v2: { loaded: 160, light: 145 },
      vref: { loaded: 130, light: 118 },
      cruise: { loaded: 450, light: 460 },
    },
    ceiling: 39100,
    range: 3100,
  },
  {
    model: 'A319',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 148, light: 133 },
      vr: { loaded: 153, light: 138 },
      v2: { loaded: 163, light: 148 },
      vref: { loaded: 132, light: 120 },
      cruise: { loaded: 454, light: 465 },
    },
    ceiling: 39100,
    range: 3750,
  },
  {
    model: 'A320',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 150, light: 135 },
      vr: { loaded: 155, light: 140 },
      v2: { loaded: 165, light: 150 },
      vref: { loaded: 135, light: 122 },
      cruise: { loaded: 454, light: 466 },
    },
    ceiling: 39100,
    range: 3300,
  },
  {
    model: 'A321',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 155, light: 140 },
      vr: { loaded: 160, light: 145 },
      v2: { loaded: 170, light: 155 },
      vref: { loaded: 140, light: 127 },
      cruise: { loaded: 454, light: 466 },
    },
    ceiling: 39100,
    range: 3200,
  },
  {
    model: 'A220',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 130, light: 118 },
      vr: { loaded: 135, light: 123 },
      v2: { loaded: 145, light: 133 },
      vref: { loaded: 125, light: 113 },
      cruise: { loaded: 470, light: 481 },
    },
    ceiling: 41000,
    range: 3400,
  },
  {
    model: 'B737',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 148, light: 132 },
      vr: { loaded: 153, light: 137 },
      v2: { loaded: 163, light: 147 },
      vref: { loaded: 140, light: 125 },
      cruise: { loaded: 453, light: 465 },
    },
    ceiling: 41000,
    range: 3115,
  },
  {
    model: 'B738',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 150, light: 134 },
      vr: { loaded: 155, light: 139 },
      v2: { loaded: 165, light: 149 },
      vref: { loaded: 142, light: 127 },
      cruise: { loaded: 453, light: 466 },
    },
    ceiling: 41000,
    range: 2935,
  },
  {
    model: 'B739',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 152, light: 136 },
      vr: { loaded: 157, light: 141 },
      v2: { loaded: 167, light: 151 },
      vref: { loaded: 144, light: 129 },
      cruise: { loaded: 453, light: 466 },
    },
    ceiling: 41000,
    range: 3200,
  },
  {
    model: 'B757',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 148, light: 130 },
      vr: { loaded: 153, light: 135 },
      v2: { loaded: 165, light: 147 },
      vref: { loaded: 135, light: 120 },
      cruise: { loaded: 461, light: 473 },
    },
    ceiling: 42000,
    range: 4100,
  },
  
  // Wide Body Jets
  {
    model: 'A330',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 155, light: 138 },
      vr: { loaded: 160, light: 143 },
      v2: { loaded: 170, light: 153 },
      vref: { loaded: 140, light: 125 },
      cruise: { loaded: 470, light: 482 },
    },
    ceiling: 41100,
    range: 7400,
  },
  {
    model: 'A340',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 158, light: 140 },
      vr: { loaded: 163, light: 145 },
      v2: { loaded: 173, light: 155 },
      vref: { loaded: 142, light: 127 },
      cruise: { loaded: 470, light: 483 },
    },
    ceiling: 41100,
    range: 9000,
  },
  {
    model: 'A350',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 152, light: 135 },
      vr: { loaded: 157, light: 140 },
      v2: { loaded: 167, light: 150 },
      vref: { loaded: 138, light: 123 },
      cruise: { loaded: 488, light: 500 },
    },
    ceiling: 43100,
    range: 9700,
  },
  {
    model: 'A380',
    manufacturer: 'Airbus',
    type: 'jet',
    speeds: {
      v1: { loaded: 165, light: 145 },
      vr: { loaded: 170, light: 150 },
      v2: { loaded: 180, light: 160 },
      vref: { loaded: 145, light: 130 },
      cruise: { loaded: 480, light: 493 },
    },
    ceiling: 43000,
    range: 8500,
  },
  {
    model: 'B767',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 155, light: 138 },
      vr: { loaded: 160, light: 143 },
      v2: { loaded: 170, light: 153 },
      vref: { loaded: 140, light: 125 },
      cruise: { loaded: 459, light: 472 },
    },
    ceiling: 43100,
    range: 6385,
  },
  {
    model: 'B777',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 160, light: 142 },
      vr: { loaded: 165, light: 147 },
      v2: { loaded: 175, light: 157 },
      vref: { loaded: 145, light: 128 },
      cruise: { loaded: 490, light: 503 },
    },
    ceiling: 43100,
    range: 9700,
  },
  {
    model: 'B787',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 155, light: 138 },
      vr: { loaded: 160, light: 143 },
      v2: { loaded: 170, light: 153 },
      vref: { loaded: 140, light: 125 },
      cruise: { loaded: 488, light: 501 },
    },
    ceiling: 43100,
    range: 7635,
  },
  {
    model: 'B747',
    manufacturer: 'Boeing',
    type: 'jet',
    speeds: {
      v1: { loaded: 165, light: 145 },
      vr: { loaded: 170, light: 150 },
      v2: { loaded: 180, light: 160 },
      vref: { loaded: 150, light: 132 },
      cruise: { loaded: 490, light: 504 },
    },
    ceiling: 43100,
    range: 8430,
  },
];

/**
 * Find aircraft data by model identifier
 * Searches by exact match first, then by partial match
 */
export function findAircraft(identifier: string): AircraftData | null {
  const normalized = identifier.toUpperCase().replace(/[-\s]/g, '');
  
  // Exact match
  let aircraft = aircraftDatabase.find(
    a => a.model.toUpperCase() === normalized
  );
  if (aircraft) return aircraft;
  
  // Partial match - check if input contains model or vice versa
  aircraft = aircraftDatabase.find(
    a => normalized.includes(a.model.toUpperCase()) || 
         a.model.toUpperCase().includes(normalized)
  );
  if (aircraft) return aircraft;
  
  // Try matching just the base model (e.g., "B737-800" -> "B737")
  const baseModel = normalized.replace(/\d{3,}$/, ''); // Remove trailing numbers
  aircraft = aircraftDatabase.find(
    a => a.model.toUpperCase().startsWith(baseModel) ||
         baseModel.startsWith(a.model.toUpperCase())
  );
  
  return aircraft || null;
}

/**
 * Get all available aircraft models for autocomplete
 */
export function getAvailableModels(): string[] {
  return aircraftDatabase.map(a => `${a.model} (${a.manufacturer})`);
}
