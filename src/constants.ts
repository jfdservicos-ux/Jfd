export const RATINGS = [
  { id: 'Caa2', label: 'Caa2', aum: 'Até R$ 1 mi', commission: 0.50 },
  { id: 'Caa1', label: 'Caa1', aum: 'R$ 1-2 mi', commission: 0.51 },
  { id: 'B3', label: 'B3', aum: 'R$ 2-3,5 mi', commission: 0.52 },
  { id: 'B2', label: 'B2', aum: 'R$ 3,5-5 mi', commission: 0.53 },
  { id: 'B1', label: 'B1', aum: 'R$ 5-7 mi', commission: 0.54 },
  { id: 'Ba3', label: 'Ba3', aum: 'R$ 7-9 mi', commission: 0.55 },
  { id: 'Ba2', label: 'Ba2', aum: 'R$ 9-12 mi', commission: 0.56 },
  { id: 'Ba1', label: 'Ba1', aum: 'R$ 12-16 mi', commission: 0.57 },
  { id: 'Baa3', label: 'Baa3', aum: 'R$ 16-21 mi', commission: 0.58 },
  { id: 'Baa2', label: 'Baa2', aum: 'R$ 21-27 mi', commission: 0.59 },
  { id: 'Baa1', label: 'Baa1', aum: 'R$ 27-35 mi', commission: 0.60 },
  { id: 'A3', label: 'A3', aum: 'R$ 35-45 mi', commission: 0.61 },
  { id: 'A2', label: 'A2', aum: 'R$ 45-58 mi', commission: 0.62 },
  { id: 'A1', label: 'A1', aum: 'R$ 58-73 mi', commission: 0.63 },
  { id: 'Aa3', label: 'Aa3', aum: 'R$ 73-90 mi', commission: 0.64 },
  { id: 'Aa2', label: 'Aa2', aum: 'R$ 90-110 mi', commission: 0.65 },
  { id: 'Aa1', label: 'Aa1', aum: 'R$ 110-135 mi', commission: 0.66 },
  { id: 'Aaa3', label: 'Aaa3', aum: 'R$ 135-165 mi', commission: 0.67 },
  { id: 'Aaa2', label: 'Aaa2', aum: 'R$ 165-200 mi', commission: 0.68 },
  { id: 'Aaa1', label: 'Aaa1 (Teto)', aum: 'Acima R$ 200 mi', commission: 0.70 },
];

export const MDCs = [
  { 
    id: 'pf', 
    label: 'Planejamento Financeiro', 
    unitLabel: 'Cliente (6x R$ 400)',
    unitValue: 2400, 
    convQual: 0.5, 
    convCold: 0.3 
  },
  { 
    id: 'ci', 
    label: 'Consultoria de Investimentos / AUM', 
    unitLabel: 'Ticket Médio',
    unitValue: 12000, 
    convQual: 0.5, 
    convCold: 0.2 
  },
  { 
    id: 'co', 
    label: 'Consórcio Inteligente', 
    unitLabel: 'Carta de R$ 300k',
    unitValue: 90000,
    unitRevenue: 9000,
    convQual: 0.1, 
    convCold: 0.02 
  }
];
