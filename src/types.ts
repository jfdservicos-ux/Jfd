export interface ProposalData {
  id?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCpf: string;
  consultantName: string;
  consultantEmail: string;
  consultantPhone: string;
  proposalDate: string;
  validUntil: string;
  
  // Financial Planning Specifics
  planningTier: 'Essencial' | 'Estratégico' | 'Empresarial' | 'Patrimonial';
  planningValue: string;
  planningPaymentMethod: string;
  planningDownPayment: string;
  planningDeliveryTime: string;
  
  // Investment Consulting Specifics
  consultingAumTier: string;
  consultingFee: string;
  consultingMinMonthly: string;
  
  // Scope
  customScope: string[];
  
  serviceType: 'planning' | 'consulting' | 'both';
  signedAt?: string;
  status?: 'draft' | 'sent' | 'signed';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  stage: 'lead' | 'diagnostico' | 'proposta' | 'fechamento' | 'cliente';
  mdc: string;
  value: number;
  expectedCloseDate: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
  potentialAum: number;
  gains: {
    goals: string;
    accomplishments: string;
    interests: string;
    networks: string;
    skills: string;
  };
  createdAt: string;
  updatedAt: string;
  bankerId: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: '1-a-1' | 'diagnostico' | 'proposta' | 'follow-up' | 'fechamento' | 'outro';
  notes: string;
  date: string;
  bankerId: string;
}

export interface Service {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  status: 'Ativo' | 'Em Execução' | 'Aguardando Documentos' | 'Suspenso';
  progress: number;
  nextStep: string;
  bankerId: string;
  startDate: string;
  revenue: number;
}

export interface MDCGoal {
  mdc: string;
  revenueGoal: number;
  avgTicket: number;
  conversionRate: number; // e.g., 0.4 for 40%
  diagnosticsNeeded: number;
  meetingsNeeded: number;
}

export interface BankerGoals {
  id: string;
  bankerId: string;
  month: string; // YYYY-MM
  mdcGoals: MDCGoal[];
  totalRevenueGoal: number;
  careerPlan: 'Junior' | 'Pleno' | 'Senior' | 'Partner';
  commissionRate: number; // e.g., 0.3 for 30%
}

export const INITIAL_DATA: ProposalData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientCpf: '',
  consultantName: 'F4 Partners',
  consultantEmail: 'contato@f4partners.com.br',
  consultantPhone: '',
  proposalDate: new Date().toLocaleDateString('pt-BR'),
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  
  planningTier: 'Estratégico',
  planningValue: '297,00',
  planningPaymentMethod: 'Cartão de Crédito / Boleto',
  planningDownPayment: '0,00',
  planningDeliveryTime: '30 dias',
  
  consultingAumTier: 'De R$ 2M a R$ 5M',
  consultingFee: '0,90% a.a.',
  consultingMinMonthly: 'R$ 4.000',
  
  customScope: [
    'Reunião de abertura e alinhamento de objetivos',
    'Diagnóstico financeiro e patrimonial estruturado',
    'Plano financeiro e patrimonial (orientativo)',
    'Reuniões de apresentação e ajustes',
    'Checklist de execução e próximos passos'
  ],
  
  serviceType: 'planning'
};
