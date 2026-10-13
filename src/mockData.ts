export const MOCK_LEADS = [
  {
    id: 'lead-1',
    name: 'Roberto Silva (Empresário)',
    type: 'client',
    stage: 'diagnostic',
    mdc: 'Sucessão Patrimonial',
    mdcValue: 15000,
    forecastDate: '2026-04-15',
    potentialValue: 5000000,
    gains: {
      goals: 'Organizar a sucessão para os 3 filhos sem conflitos.',
      accomplishments: 'Venda da indústria familiar por R$ 50M.',
      interests: 'Filantropia e Cavalos.',
      networks: 'Lions Club e FIESP.',
      skills: 'Gestão industrial e negociação.'
    },
    lastContact: { seconds: Date.now() / 1000 - 86400 * 2 }
  },
  {
    id: 'lead-2',
    name: 'Dra. Ana Paula (Médica)',
    type: 'client',
    stage: 'proposal',
    mdc: 'Consultoria de Investimentos (AUM)',
    mdcValue: 25000,
    forecastDate: '2026-05-20',
    potentialValue: 2500000,
    gains: {
      goals: 'Aposentadoria precoce aos 55 anos.',
      accomplishments: 'Doutorado em Harvard.',
      interests: 'Viagens exóticas e Yoga.',
      networks: 'Conselho Regional de Medicina.',
      skills: 'Cirurgia plástica.'
    },
    lastContact: { seconds: Date.now() / 1000 - 86400 * 5 }
  },
  {
    id: 'lead-3',
    name: 'Carlos Mendes (Contador)',
    type: 'partner',
    stage: 'lead',
    mdc: 'Planejamento Financeiro',
    mdcValue: 5000,
    forecastDate: '2026-04-10',
    potentialValue: 0,
    gains: {
      goals: 'Oferecer valor agregado aos seus clientes PJ.',
      accomplishments: 'Escritório com 200 clientes ativos.',
      interests: 'Tecnologia e Auditoria.',
      networks: 'CRC e Associações de Bairro.',
      skills: 'Tributário e Contabilidade.'
    },
    lastContact: { seconds: Date.now() / 1000 - 86400 * 1 }
  }
];

export const MOCK_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'Diagnóstico',
    notes: 'Reunião de diagnóstico com Roberto Silva. Foco em sucessão.',
    date: { seconds: Date.now() / 1000 - 3600 * 2 }
  },
  {
    id: 'act-2',
    type: '1-a-1',
    notes: 'Café com Carlos Mendes para alinhar modelo de parceria.',
    date: { seconds: Date.now() / 1000 - 86400 * 1 }
  },
  {
    id: 'act-3',
    type: 'Proposta',
    notes: 'Envio de proposta de alocação para Dra. Ana Paula.',
    date: { seconds: Date.now() / 1000 - 86400 * 3 }
  }
];

export const NEURO_INSIGHTS = [
  {
    title: 'O Poder da Escrita (Log)',
    content: 'Escrever o Log de Atividades ativa o córtex pré-frontal, transformando memória de curto prazo em aprendizado. Isso reduz a ansiedade de "esquecer algo" e libera dopamina ao concluir tarefas.',
    icon: 'Brain'
  },
  {
    title: 'Rapport Biológico (GAINS)',
    content: 'O GAINS estimula a liberação de ocitocina. Ao falar sobre Goals e Accomplishments, o cliente se sente validado, o que desativa a amígdala (centro do medo/desconfiança) e abre caminho para o diagnóstico.',
    icon: 'Users'
  },
  {
    title: 'Inércia do Pipeline',
    content: 'O cérebro prefere caminhos conhecidos. Manter o pipeline em movimento constante cria uma "inércia cognitiva", tornando a prospecção um hábito automático em vez de um esforço consciente exaustivo.',
    icon: 'TrendingUp'
  },
  {
    title: 'Ancoragem de Valor',
    content: 'No Diagnóstico, a primeira dor identificada serve como âncora. Se você resolve a dor principal, o cérebro do cliente tende a aceitar a proposta com menos resistência, focando na solução e não no custo.',
    icon: 'Target'
  },
  {
    title: 'Fadiga de Decisão',
    content: 'Prospecção exige alta carga cognitiva. Realize seus MDCs mais difíceis nas primeiras 3 horas do seu dia, quando seu estoque de glicose cerebral para decisões complexas está no auge.',
    icon: 'Zap'
  },
  {
    title: 'O Gatilho da Reciprocidade',
    content: 'Ao atuar com MDCs Principais e de Apoio, você ativa o gatilho da reciprocidade. O cliente sente a necessidade biológica de retribuir a confiança ao ver seu patrimônio protegido e crescendo.',
    icon: 'Handshake'
  }
];
