import type { AirportFrequency } from '@/types/flight';

/**
 * Banco de dados estático de frequências dos principais aeroportos brasileiros
 * Fonte: AIP Brasil / DECEA (atualizado periodicamente)
 * 
 * ATENÇÃO: Estas frequências são para fins de treinamento e podem estar desatualizadas.
 * Sempre consulte o AIP Brasil oficial para voos reais.
 */
export const BRAZILIAN_AIRPORT_FREQUENCIES: Record<string, AirportFrequency[]> = {
  // São Paulo - Guarulhos
  'SBGR': [
    { type: 'ATIS', frequency: '127.750', name: 'ATIS Guarulhos' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Guarulhos' },
    { type: 'GND', frequency: '121.650', name: 'Solo Guarulhos' },
    { type: 'TWR', frequency: '132.100', name: 'Torre Guarulhos' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação São Paulo' },
    { type: 'DEP', frequency: '119.400', name: 'Controle São Paulo' },
  ],
  
  // São Paulo - Congonhas
  'SBSP': [
    { type: 'ATIS', frequency: '127.650', name: 'ATIS Congonhas' },
    { type: 'CLR', frequency: '121.050', name: 'Tráfego Congonhas' },
    { type: 'GND', frequency: '121.900', name: 'Solo Congonhas' },
    { type: 'TWR', frequency: '118.100', name: 'Torre Congonhas' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação São Paulo' },
    { type: 'DEP', frequency: '127.150', name: 'Controle São Paulo' },
  ],
  
  // Rio de Janeiro - Santos Dumont
  'SBRJ': [
    { type: 'ATIS', frequency: '132.650', name: 'ATIS Santos Dumont' },
    { type: 'CLR', frequency: '121.050', name: 'Tráfego Santos Dumont' },
    { type: 'GND', frequency: '121.750', name: 'Solo Santos Dumont' },
    { type: 'TWR', frequency: '118.700', name: 'Torre Santos Dumont' },
    { type: 'APP', frequency: '119.000', name: 'Aproximação Rio' },
    { type: 'DEP', frequency: '119.500', name: 'Controle Rio' },
  ],
  
  // Rio de Janeiro - Galeão
  'SBGL': [
    { type: 'ATIS', frequency: '127.600', name: 'ATIS Galeão' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Galeão' },
    { type: 'GND', frequency: '121.650', name: 'Solo Galeão' },
    { type: 'TWR', frequency: '118.000', name: 'Torre Galeão' },
    { type: 'APP', frequency: '119.000', name: 'Aproximação Rio' },
    { type: 'DEP', frequency: '119.500', name: 'Controle Rio' },
  ],
  
  // Brasília
  'SBBR': [
    { type: 'ATIS', frequency: '127.800', name: 'ATIS Brasília' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Brasília' },
    { type: 'GND', frequency: '121.800', name: 'Solo Brasília' },
    { type: 'TWR', frequency: '118.100', name: 'Torre Brasília' },
    { type: 'APP', frequency: '119.000', name: 'Aproximação Brasília' },
    { type: 'DEP', frequency: '120.200', name: 'Controle Brasília' },
  ],
  
  // Campinas - Viracopos
  'SBKP': [
    { type: 'ATIS', frequency: '127.575', name: 'ATIS Viracopos' },
    { type: 'CLR', frequency: '121.200', name: 'Tráfego Viracopos' },
    { type: 'GND', frequency: '121.700', name: 'Solo Viracopos' },
    { type: 'TWR', frequency: '118.350', name: 'Torre Viracopos' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação São Paulo' },
    { type: 'DEP', frequency: '121.350', name: 'Controle São Paulo' },
  ],
  
  // Belo Horizonte - Confins
  'SBCF': [
    { type: 'ATIS', frequency: '127.850', name: 'ATIS Confins' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Confins' },
    { type: 'GND', frequency: '121.950', name: 'Solo Confins' },
    { type: 'TWR', frequency: '118.200', name: 'Torre Confins' },
    { type: 'APP', frequency: '119.400', name: 'Aproximação Belo Horizonte' },
    { type: 'DEP', frequency: '125.550', name: 'Controle Belo Horizonte' },
  ],
  
  // Belo Horizonte - Pampulha
  'SBBH': [
    { type: 'ATIS', frequency: '127.950', name: 'ATIS Pampulha' },
    { type: 'GND', frequency: '121.700', name: 'Solo Pampulha' },
    { type: 'TWR', frequency: '118.900', name: 'Torre Pampulha' },
    { type: 'APP', frequency: '119.400', name: 'Aproximação Belo Horizonte' },
  ],
  
  // Porto Alegre - Salgado Filho
  'SBPA': [
    { type: 'ATIS', frequency: '127.700', name: 'ATIS Porto Alegre' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Porto Alegre' },
    { type: 'GND', frequency: '121.900', name: 'Solo Porto Alegre' },
    { type: 'TWR', frequency: '118.100', name: 'Torre Porto Alegre' },
    { type: 'APP', frequency: '120.800', name: 'Aproximação Porto Alegre' },
    { type: 'DEP', frequency: '127.400', name: 'Controle Porto Alegre' },
  ],
  
  // Curitiba - Afonso Pena
  'SBCT': [
    { type: 'ATIS', frequency: '127.675', name: 'ATIS Curitiba' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Curitiba' },
    { type: 'GND', frequency: '121.700', name: 'Solo Curitiba' },
    { type: 'TWR', frequency: '118.550', name: 'Torre Curitiba' },
    { type: 'APP', frequency: '120.100', name: 'Aproximação Curitiba' },
    { type: 'DEP', frequency: '126.650', name: 'Controle Curitiba' },
  ],
  
  // Florianópolis
  'SBFL': [
    { type: 'ATIS', frequency: '127.600', name: 'ATIS Florianópolis' },
    { type: 'GND', frequency: '121.900', name: 'Solo Florianópolis' },
    { type: 'TWR', frequency: '118.300', name: 'Torre Florianópolis' },
    { type: 'APP', frequency: '120.900', name: 'Aproximação Florianópolis' },
  ],
  
  // Salvador
  'SBSV': [
    { type: 'ATIS', frequency: '127.975', name: 'ATIS Salvador' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Salvador' },
    { type: 'GND', frequency: '121.750', name: 'Solo Salvador' },
    { type: 'TWR', frequency: '118.350', name: 'Torre Salvador' },
    { type: 'APP', frequency: '120.000', name: 'Aproximação Salvador' },
    { type: 'DEP', frequency: '120.200', name: 'Controle Salvador' },
  ],
  
  // Recife - Guararapes
  'SBRF': [
    { type: 'ATIS', frequency: '127.550', name: 'ATIS Recife' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Recife' },
    { type: 'GND', frequency: '121.900', name: 'Solo Recife' },
    { type: 'TWR', frequency: '118.700', name: 'Torre Recife' },
    { type: 'APP', frequency: '118.400', name: 'Aproximação Recife' },
    { type: 'DEP', frequency: '128.200', name: 'Controle Recife' },
  ],
  
  // Fortaleza
  'SBFZ': [
    { type: 'ATIS', frequency: '127.900', name: 'ATIS Fortaleza' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Fortaleza' },
    { type: 'GND', frequency: '121.700', name: 'Solo Fortaleza' },
    { type: 'TWR', frequency: '118.600', name: 'Torre Fortaleza' },
    { type: 'APP', frequency: '119.350', name: 'Aproximação Fortaleza' },
    { type: 'DEP', frequency: '120.100', name: 'Controle Fortaleza' },
  ],
  
  // Manaus - Eduardo Gomes
  'SBEG': [
    { type: 'ATIS', frequency: '127.850', name: 'ATIS Manaus' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Manaus' },
    { type: 'GND', frequency: '121.900', name: 'Solo Manaus' },
    { type: 'TWR', frequency: '118.400', name: 'Torre Manaus' },
    { type: 'APP', frequency: '119.200', name: 'Aproximação Manaus' },
    { type: 'DEP', frequency: '125.900', name: 'Controle Manaus' },
  ],
  
  // Belém - Val de Cans
  'SBBE': [
    { type: 'ATIS', frequency: '127.600', name: 'ATIS Belém' },
    { type: 'CLR', frequency: '121.000', name: 'Tráfego Belém' },
    { type: 'GND', frequency: '121.700', name: 'Solo Belém' },
    { type: 'TWR', frequency: '118.300', name: 'Torre Belém' },
    { type: 'APP', frequency: '119.600', name: 'Aproximação Belém' },
    { type: 'DEP', frequency: '124.050', name: 'Controle Belém' },
  ],
  
  // Natal
  'SBNT': [
    { type: 'ATIS', frequency: '127.450', name: 'ATIS Natal' },
    { type: 'GND', frequency: '121.700', name: 'Solo Natal' },
    { type: 'TWR', frequency: '118.500', name: 'Torre Natal' },
    { type: 'APP', frequency: '119.800', name: 'Aproximação Natal' },
  ],
  
  // Goiânia
  'SBGO': [
    { type: 'ATIS', frequency: '127.425', name: 'ATIS Goiânia' },
    { type: 'GND', frequency: '121.900', name: 'Solo Goiânia' },
    { type: 'TWR', frequency: '118.200', name: 'Torre Goiânia' },
    { type: 'APP', frequency: '119.750', name: 'Aproximação Goiânia' },
  ],
  
  // Cuiabá
  'SBCY': [
    { type: 'ATIS', frequency: '127.525', name: 'ATIS Cuiabá' },
    { type: 'GND', frequency: '121.850', name: 'Solo Cuiabá' },
    { type: 'TWR', frequency: '118.100', name: 'Torre Cuiabá' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação Cuiabá' },
  ],
  
  // Campo Grande
  'SBCG': [
    { type: 'ATIS', frequency: '127.350', name: 'ATIS Campo Grande' },
    { type: 'GND', frequency: '121.800', name: 'Solo Campo Grande' },
    { type: 'TWR', frequency: '118.400', name: 'Torre Campo Grande' },
    { type: 'APP', frequency: '119.500', name: 'Aproximação Campo Grande' },
  ],
  
  // Vitória
  'SBVT': [
    { type: 'ATIS', frequency: '127.625', name: 'ATIS Vitória' },
    { type: 'GND', frequency: '121.800', name: 'Solo Vitória' },
    { type: 'TWR', frequency: '118.350', name: 'Torre Vitória' },
    { type: 'APP', frequency: '119.350', name: 'Aproximação Vitória' },
  ],
  
  // João Pessoa
  'SBJP': [
    { type: 'ATIS', frequency: '127.350', name: 'ATIS João Pessoa' },
    { type: 'GND', frequency: '121.900', name: 'Solo João Pessoa' },
    { type: 'TWR', frequency: '118.100', name: 'Torre João Pessoa' },
    { type: 'APP', frequency: '119.600', name: 'Aproximação João Pessoa' },
  ],
  
  // Maceió
  'SBMO': [
    { type: 'ATIS', frequency: '127.650', name: 'ATIS Maceió' },
    { type: 'GND', frequency: '121.700', name: 'Solo Maceió' },
    { type: 'TWR', frequency: '118.300', name: 'Torre Maceió' },
    { type: 'APP', frequency: '119.600', name: 'Aproximação Maceió' },
  ],
  
  // Aracaju
  'SBAR': [
    { type: 'GND', frequency: '121.700', name: 'Solo Aracaju' },
    { type: 'TWR', frequency: '118.600', name: 'Torre Aracaju' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação Aracaju' },
  ],
  
  // Teresina
  'SBTE': [
    { type: 'GND', frequency: '121.900', name: 'Solo Teresina' },
    { type: 'TWR', frequency: '118.400', name: 'Torre Teresina' },
    { type: 'APP', frequency: '119.200', name: 'Aproximação Teresina' },
  ],
  
  // São Luís
  'SBSL': [
    { type: 'ATIS', frequency: '127.850', name: 'ATIS São Luís' },
    { type: 'GND', frequency: '121.900', name: 'Solo São Luís' },
    { type: 'TWR', frequency: '118.100', name: 'Torre São Luís' },
    { type: 'APP', frequency: '119.200', name: 'Aproximação São Luís' },
  ],
  
  // Joinville
  'SBJV': [
    { type: 'GND', frequency: '121.600', name: 'Solo Joinville' },
    { type: 'TWR', frequency: '118.800', name: 'Torre Joinville' },
  ],
  
  // Londrina
  'SBLO': [
    { type: 'GND', frequency: '121.700', name: 'Solo Londrina' },
    { type: 'TWR', frequency: '118.000', name: 'Torre Londrina' },
    { type: 'APP', frequency: '120.700', name: 'Aproximação Londrina' },
  ],
  
  // Navegantes
  'SBNF': [
    { type: 'GND', frequency: '121.700', name: 'Solo Navegantes' },
    { type: 'TWR', frequency: '118.100', name: 'Torre Navegantes' },
    { type: 'APP', frequency: '119.300', name: 'Aproximação Navegantes' },
  ],
  
  // Ribeirão Preto
  'SBRP': [
    { type: 'GND', frequency: '121.600', name: 'Solo Ribeirão Preto' },
    { type: 'TWR', frequency: '118.400', name: 'Torre Ribeirão Preto' },
    { type: 'APP', frequency: '120.200', name: 'Aproximação Ribeirão Preto' },
  ],
  
  // São José dos Campos
  'SBSJ': [
    { type: 'GND', frequency: '121.800', name: 'Solo São José' },
    { type: 'TWR', frequency: '118.100', name: 'Torre São José' },
    { type: 'APP', frequency: '119.100', name: 'Aproximação São Paulo' },
  ],
  
  // Foz do Iguaçu
  'SBFI': [
    { type: 'ATIS', frequency: '127.575', name: 'ATIS Foz do Iguaçu' },
    { type: 'GND', frequency: '121.700', name: 'Solo Foz do Iguaçu' },
    { type: 'TWR', frequency: '118.500', name: 'Torre Foz do Iguaçu' },
    { type: 'APP', frequency: '119.400', name: 'Aproximação Foz do Iguaçu' },
  ],
  
  // Campos dos Goytacazes
  'SBCP': [
    { type: 'TWR', frequency: '118.200', name: 'Torre Campos' },
  ],
  
  // Uberlândia
  'SBUL': [
    { type: 'GND', frequency: '121.900', name: 'Solo Uberlândia' },
    { type: 'TWR', frequency: '118.050', name: 'Torre Uberlândia' },
    { type: 'APP', frequency: '119.950', name: 'Aproximação Uberlândia' },
  ],
  
  // Maringá
  'SBMG': [
    { type: 'GND', frequency: '121.900', name: 'Solo Maringá' },
    { type: 'TWR', frequency: '118.300', name: 'Torre Maringá' },
    { type: 'APP', frequency: '119.600', name: 'Aproximação Maringá' },
  ],
};

/**
 * Busca frequências de um aeroporto no banco de dados estático
 * @param icao Código ICAO do aeroporto (ex: SBGR)
 * @returns Array de frequências ou undefined se não encontrado
 */
export function getAirportFrequencies(icao: string): AirportFrequency[] | undefined {
  return BRAZILIAN_AIRPORT_FREQUENCIES[icao.toUpperCase()];
}

/**
 * Verifica se um aeroporto tem frequências cadastradas
 * @param icao Código ICAO do aeroporto
 * @returns true se há frequências cadastradas
 */
export function hasAirportFrequencies(icao: string): boolean {
  return icao.toUpperCase() in BRAZILIAN_AIRPORT_FREQUENCIES;
}
