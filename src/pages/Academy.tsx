import { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  BarChart3,
  FileText,
  MessageSquare,
  Award,
  Brain,
  Zap,
  X,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MODULES = [
  {
    id: 0,
    title: 'Módulo 0: Fundamentos do MOC-F4',
    description: 'A base da padronização: Captação, Condução e Retenção.',
    icon: Target,
    lessons: [
      { 
        title: 'O que é o MOC-F4', 
        content: 'O Método Operacional de Crescimento (MOC-F4) é um sistema oficial de execução, crescimento e governança da F4 Partners. Ele tira o crescimento do campo da sorte. Sem método, cada banker trabalha do seu jeito e não há padrão. Com o MOC-F4, existe matemática por trás da meta, padrão de atividade e governança.',
        mentor: 'Cultura não é discurso. Cultura é comportamento repetido com padrão. O MOC-F4 cria uma linguagem, ritmo e padrão comum para todos os Bankers.'
      },
      { 
        title: 'O que é um MDC (Mecanismo Direto de Crescimento)', 
        content: 'MDC é qualquer atividade, produto ou linha de atuação que gera crescimento mensurável de receita, AUM ou recorrência. É a forma concreta pela qual o banker transforma esforço em crescimento. No MOC-F4, toda meta, atividade e KPI deve estar vinculada a um MDC. Se uma atividade não alimenta um MDC, ela é ruído.',
        mentor: 'O MDC existe para eliminar ambiguidade e forçar foco estratégico. Cada banker deve operar com 2 MDCs principais (foco) e até 3 de suporte.'
      },
      { 
        title: 'Checklist de Implantação', 
        content: 'Antes de começar, execute o checklist individual: 1. Cadastrar nome no CRM. 2. Preencher seu GAINS pessoal. 3. Definir seus MDCs prioritários. 4. Preencher metas do mês por MDC. 5. Registrar atividades diariamente no Log.',
        mentor: 'O que não está registrado no Log, não aconteceu. O método exige rastreabilidade para decidir com clareza.'
      }
    ],
    exercise: {
      question: 'Qual é o conceito-chave fundamental do Módulo 0 sobre o registro de atividades?',
      options: [
        'O Log serve apenas para controle da diretoria',
        'O que não está registrado no Log, não aconteceu',
        'O Log deve ser preenchido apenas uma vez por mês',
        'Atividades sem registro ainda geram crescimento previsível'
      ],
      correct: 1
    }
  },
  {
    id: 1,
    title: 'Módulo 1: Pilar 1 - Clareza Estratégica',
    description: 'Transformando meta em conta e matemática em execução.',
    icon: TrendingUp,
    lessons: [
      { 
        title: 'Meta em Conta & MDCs', 
        content: 'Clareza Estratégica é transformar meta em conta. O Banker deve dominar os MDCs (Mecanismos Diretos de Crescimento): 1. Planejamento Financeiro. 2. Consultoria de Investimentos (AUM). 3. Consórcios Inteligente. 4. Investimentos Globais. 5. Seguros. 6. Sucessão Patrimonial. 7. Home Equity. 8. Plataforma de Garantia de Aluguel.',
        mentor: 'Escolha 2 MDCs principais para foco total e até 3 de suporte. Domine a técnica e a narrativa de cada um antes de ir para o campo.'
      },
      { 
        title: 'Canais Dominantes', 
        content: 'Defina seu canal dominante de prospecção: 1. Rede/Parcerias. 2. Conteúdo. 3. Base/Indicações. 4. Prospecção Ativa. O foco em um canal aumenta a eficiência e a especialização do Banker.',
        mentor: 'Escolha o canal que mais se alinha com suas Skills e Networks mapeadas no seu GAINS pessoal.'
      }
    ],
    exercise: {
      question: 'Qual o primeiro passo para estabelecer a Clareza Estratégica no MOC-F4?',
      options: [
        'Fazer o máximo de reuniões possível',
        'Escolher os MDCs prioritários do mês',
        'Esperar o cliente entrar em contato',
        'Focar apenas em conteúdo para redes sociais'
      ],
      correct: 1
    }
  },
  {
    id: 2,
    title: 'Módulo 2: Pilar 2 - Atividades de Resultado',
    description: 'As 6 atividades-mãe que movem o funil de vendas.',
    icon: Zap,
    lessons: [
      { 
        title: 'As 6 Atividades-Mãe', 
        content: 'Toda semana o Banker deve focar em: 1. Reuniões 1-a-1 estratégicas. 2. Diagnósticos patrimoniais. 3. Reuniões de proposta. 4. Follow-ups estruturados. 5. Ações de autoridade. 6. Atualização do CRM/Log.',
        mentor: 'A atividade correta é a que move etapa (Lead → Diagnóstico → Proposta → Fechamento). Se não moveu etapa, faltou objetivo.'
      },
      { 
        title: 'Framework GAINS (3 Personas)', 
        content: 'O GAINS é o instrumento central de conexão. Para o Cliente Final: entender objetivos e dores. Para o Parceiro: criar sinergia e troca de valor. Para o Banker: autoconhecimento estratégico. O GAINS transforma conversa em relacionamento estratégico.',
        mentor: 'Após qualquer reunião GAINS, você deve saber: É cliente ou parceiro? Qual MDC alimenta? Qual o próximo passo? Qual valor posso entregar antes de pedir?'
      },
      { 
        title: 'Roteiros Operacionais', 
        content: 'O manual define roteiros claros para 1-a-1 (30-45 min), Diagnóstico (45-60 min) e Follow-up (cadência D+1, D+3, D+7, D+14). Lead sem próxima ação é lead perdido.',
        mentor: 'No Diagnóstico, o objetivo é entender a "Foto Atual" e as "Dores". Não tente vender produtos antes de validar o entendimento do problema.'
      }
    ],
    exercise: {
      question: 'No MOC-F4, o que define se uma atividade foi realmente produtiva?',
      options: [
        'O tempo gasto na reunião',
        'Se a atividade moveu o lead de etapa no funil',
        'O número de curtidas no post de autoridade',
        'A quantidade de café tomado com o parceiro'
      ],
      correct: 1
    }
  },
  {
    id: 3,
    title: 'Módulo 3: Pilar 3 - Ecossistema de Indicações',
    description: 'Transformando networking em um mecanismo previsível.',
    icon: Users,
    lessons: [
      { 
        title: 'Mapa de Parceiros', 
        content: 'A F4 cresce por rede qualificada. O processo de 30 dias inclui: Escolher sua esfera (ex: contadores, advogados), criar a "Lista 20", agendar 1-a-1s, entregar valor e fazer pedidos claros de indicação com foco no PCI (Perfil de Cliente Ideal).',
        mentor: 'Não peça indicações genéricas. Seja específico: "Quero ajudar famílias com patrimônio a partir de R$ X que valorizam independência".'
      },
      { 
        title: 'Cadência de Rede', 
        content: 'Mantenha contato a cada 30-60 dias com parceiros de nível A. O objetivo é ser o primeiro nome lembrado quando o assunto é gestão patrimonial independente.',
        mentor: 'O gatilho da reciprocidade é ativado quando você entrega valor real ao parceiro antes de pedir algo em troca.'
      }
    ],
    exercise: {
      question: 'O que significa PCI no contexto de pedidos de indicação?',
      options: [
        'Plano de Carreira Individual',
        'Perfil de Cliente Ideal',
        'Processo de Conversão Imediata',
        'Pedido de Contato Inicial'
      ],
      correct: 1
    }
  },
  {
    id: 4,
    title: 'Módulo 4: Pilar 4 - Ritmo de Reuniões',
    description: 'Governança e cadência para manter a execução no trilho.',
    icon: BarChart3,
    lessons: [
      { 
        title: 'Reunião Semanal Operacional', 
        content: '30-45 min com pauta fixa: Scorecard, Funil (leads quentes), Gargalos e Compromissos para a próxima semana. Não é para discutir teoria, é para destravar execução.',
        mentor: 'Toda reunião deve terminar com: Quem faz o quê até quando.'
      },
      { 
        title: 'Reuniões Mensais e Trimestrais', 
        content: 'Mensal: Foco em Metas por MDC, Conversões e Qualidade do Funil. Trimestral: Revisão de crescimento AUM, Estratégia de produtos e Desenvolvimento de Skills do Banker.',
        mentor: 'O ritmo de reuniões é o que garante que o método não seja abandonado na primeira dificuldade do mercado.'
      }
    ],
    exercise: {
      question: 'Qual o objetivo principal da Reunião Semanal Operacional?',
      options: [
        'Discutir notícias de macroeconomia',
        'Destravar a execução e definir próximas ações claras',
        'Fazer treinamentos técnicos de produtos',
        'Socializar com outros Bankers'
      ],
      correct: 1
    }
  },
  {
    id: 5,
    title: 'Módulo 5: Pilar 5 - GAINS do Banker',
    description: 'Alinhando sua identidade com sua performance.',
    icon: Award,
    lessons: [
      { 
        title: 'Autoaplicação Estratégica', 
        content: 'Preencha seu GAINS mensalmente: Goals (metas 12 meses), Accomplishments (cases e certificações), Interests (segmentos que geram energia), Networks (onde você tem acesso real) e Skills (habilidades a desenvolver).',
        mentor: 'Se seu Network é forte em empresários, sua esfera de indicações deve ser focada neles. Não lute contra suas próprias forças.'
      },
      { 
        title: 'Estudo Contínuo e Certificações', 
        content: 'O Banker F4 deve estudar vendas complexas, psicologia financeira e manter certificações (CEA, CFP®). O conhecimento técnico constrói autoridade e confiança.',
        mentor: 'Estudar faz parte da execução. Reserve tempo na agenda para ler relatórios de gestores e acompanhar a geopolítica.'
      }
    ],
    exercise: {
      question: 'Por que o GAINS pessoal do Banker deve ser revisado mensalmente?',
      options: [
        'Para mudar de carreira todo mês',
        'Para alinhar identidade com performance e ajustar o foco estratégico',
        'Porque é uma regra sem propósito prático',
        'Para decorar os nomes dos colegas'
      ],
      correct: 1
    }
  },
  {
    id: 6,
    title: 'Módulo 6: KPIs e Scorecards',
    description: 'O painel de controle do Banker de Alta Performance.',
    icon: Shield,
    lessons: [
      { 
        title: 'O que medir', 
        content: 'KPIs oficiais: Reuniões estratégicas, Diagnósticos concluídos, Taxa de conversão, Receita por MDC e Crescimento de AUM. Use os dados para ajustar a rota, não para punição.',
        mentor: 'Os KPIs são o painel do piloto. Se a taxa de conversão está baixa, o problema pode estar no PCI ou na qualidade da proposta.'
      },
      { 
        title: 'Rotina de Excelência', 
        content: 'Diária: Atualizar Log, verificar próximas ações. Semanal: Validar Scorecard, listar leads quentes e identificar 1 gargalo principal.',
        mentor: 'Disciplina e registro constroem crescimento previsível. Sem método, não há escala.'
      }
    ],
    exercise: {
      question: 'Qual a função principal dos KPIs no MOC-F4?',
      options: [
        'Punir Bankers que não batem metas',
        'Servir como painel de ajuste para melhorar a execução',
        'Substituir as reuniões semanais',
        'Apenas para fins de marketing'
      ],
      correct: 1
    }
  }
];

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseAnswer, setExerciseAnswer] = useState<number | null>(null);
  const [exerciseResult, setExerciseResult] = useState<'success' | 'error' | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const handleModuleSelect = (module: any) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setShowExercise(false);
    setExerciseAnswer(null);
    setExerciseResult(null);
  };

  const handleCheckExercise = () => {
    if (exerciseAnswer === selectedModule.exercise.correct) {
      setExerciseResult('success');
      if (!completedModules.includes(selectedModule.id)) {
        setCompletedModules([...completedModules, selectedModule.id]);
      }
      // Auto-advance logic: after a short delay, move to next module or show completion
      setTimeout(() => {
        handleNextModule();
      }, 3000);
    } else {
      setExerciseResult('error');
    }
  };

  const handleNextModule = () => {
    const nextIndex = MODULES.findIndex(m => m.id === selectedModule.id) + 1;
    if (nextIndex < MODULES.length) {
      handleModuleSelect(MODULES[nextIndex]);
    } else {
      setSelectedModule(null);
      setShowExercise(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-f4-blue tracking-tight">F4 Academy</h1>
          <p className="text-slate-500 font-medium">Treinamento Oficial do Método Operacional de Crescimento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-400 font-bold text-xs">+{i}</div>
            ))}
          </div>
          <p className="text-sm font-bold text-f4-blue">12 Bankers em treinamento</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODULES.map((module) => (
              <motion.div 
                key={module.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleModuleSelect(module)}
                className={`glass-card p-8 rounded-3xl cursor-pointer transition-all border-2 ${
                  selectedModule?.id === module.id ? 'border-f4-gold' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-f4-blue text-white rounded-2xl shadow-lg shadow-f4-blue/20">
                    <module.icon size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Módulo {module.id}</div>
                    {completedModules.includes(module.id) && (
                      <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase mt-1">
                        <CheckCircle2 size={12} /> Concluído
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-f4-blue mb-2 tracking-tight">{module.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{module.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-f4-blue uppercase tracking-tighter">{module.lessons.length} Aulas</span>
                  <div className="flex items-center gap-1 text-f4-gold font-bold text-sm">
                    {selectedModule?.id === module.id ? 'Estudando' : 'Começar'} <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lesson Content Area */}
          <AnimatePresence mode="wait">
            {selectedLesson && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-card p-10 rounded-3xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-f4-blue tracking-tight">{selectedLesson.title}</h2>
                  <button onClick={() => setSelectedLesson(null)} className="text-slate-400 hover:text-f4-blue"><X size={24} /></button>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {selectedLesson.content}
                  </p>
                </div>

                <div className="bg-[#0A192F] text-white p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Brain size={120} />
                  </div>
                  <h4 className="text-f4-gold font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2 relative z-10">
                    <Lightbulb size={16} /> Mentor Mode: Insight Estratégico
                  </h4>
                  <p className="text-white text-lg font-bold leading-relaxed italic relative z-10">
                    "{selectedLesson.mentor}"
                  </p>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => setSelectedLesson(null)}
                    className="px-8 py-4 text-slate-500 font-bold hover:text-f4-blue transition-all"
                  >
                    Voltar para Módulo
                  </button>
                  <button 
                    onClick={() => {
                      const currentIndex = selectedModule.lessons.indexOf(selectedLesson);
                      if (currentIndex < selectedModule.lessons.length - 1) {
                        setSelectedLesson(selectedModule.lessons[currentIndex + 1]);
                      } else {
                        setShowExercise(true);
                        setSelectedLesson(null);
                      }
                    }}
                    className="px-8 py-4 bg-f4-blue text-white rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20"
                  >
                    Próxima Aula
                  </button>
                </div>
              </motion.div>
            )}

            {showExercise && selectedModule && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-card p-10 rounded-3xl space-y-8"
              >
                <div className="flex items-center gap-3 text-f4-gold">
                  <Award size={32} />
                  <h2 className="text-2xl font-bold text-f4-blue tracking-tight">Exercício de Fixação</h2>
                </div>
                
                <div className="space-y-6">
                  <p className="text-xl font-bold text-f4-blue leading-tight">
                    {selectedModule.exercise.question}
                  </p>
                  
                  <div className="space-y-3">
                    {selectedModule.exercise.options.map((option: string, i: number) => (
                      <button 
                        key={i}
                        onClick={() => setExerciseAnswer(i)}
                        className={`w-full p-6 rounded-2xl text-left font-bold transition-all border-2 ${
                          exerciseAnswer === i 
                            ? 'border-f4-blue bg-f4-blue/5 text-f4-blue' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-f4-blue/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            exerciseAnswer === i ? 'border-f4-blue bg-f4-blue text-white' : 'border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          {option}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {exerciseResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl flex items-center gap-4 ${
                      exerciseResult === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {exerciseResult === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="font-bold">
                      {exerciseResult === 'success' 
                        ? 'Excelente! Você dominou este conceito fundamental do MOC-F4.' 
                        : 'Quase lá! Revise as aulas deste módulo para consolidar o entendimento.'}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => setShowExercise(false)}
                    className="px-8 py-4 text-slate-500 font-bold hover:text-f4-blue transition-all"
                  >
                    Revisar Aulas
                  </button>
                  {exerciseResult === 'success' ? (
                    <button 
                      onClick={handleNextModule}
                      className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Avançar para Próximo Módulo
                    </button>
                  ) : (
                    <button 
                      onClick={handleCheckExercise}
                      disabled={exerciseAnswer === null}
                      className="px-10 py-4 bg-f4-gold text-f4-blue rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-f4-gold/20 disabled:opacity-50 disabled:scale-100"
                    >
                      Verificar Resposta
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Lesson View */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {selectedModule && !selectedLesson && !showExercise ? (
              <motion.div 
                key="module-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-8 rounded-3xl sticky top-8"
              >
                <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-3">
                  <BookOpen size={24} className="text-f4-gold" /> Conteúdo do Módulo
                </h3>
                <div className="space-y-4">
                  {selectedModule.lessons.map((lesson: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedLesson(lesson)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-f4-blue transition-all">
                        <Play size={18} fill="currentColor" />
                      </div>
                      <span className="text-sm font-bold text-f4-blue flex-1 leading-tight">{lesson.title}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowExercise(true)}
                  className="mt-8 w-full f4-gradient text-white py-4 rounded-2xl font-bold shadow-xl shadow-f4-blue/20 hover:scale-[1.02] transition-all"
                >
                  Ir para Exercício
                </button>
              </motion.div>
            ) : !selectedLesson && !showExercise && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-10 rounded-3xl text-center space-y-6"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <BookOpen size={40} />
                </div>
                <h3 className="text-xl font-bold text-f4-blue">Selecione um Módulo</h3>
                <p className="text-sm text-slate-400 font-medium">Escolha um módulo ao lado para ver as aulas e materiais de apoio.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tips */}
          <div className="glass-card p-8 rounded-3xl bg-[#0A192F] text-white overflow-hidden relative border border-white/10">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Brain size={120} />
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <Zap size={20} className="text-f4-gold" /> Neuro-Aprendizado
            </h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6 relative z-10">
              O cérebro aprende melhor por **Chunking** (fragmentação). Cada módulo aqui é um "chunk" que, quando dominado, torna-se um processo automático (gânglios da base), liberando sua consciência para a estratégia.
            </p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
              <p className="text-xs font-bold text-f4-gold uppercase tracking-widest mb-2">Dica do Mentor</p>
              <p className="text-xs text-slate-200 font-medium">Assista uma aula e aplique no CRM imediatamente. A prática consolida a memória de longo prazo.</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl bg-f4-blue text-white overflow-hidden relative border border-white/10">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <MessageSquare size={120} />
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <FileText size={20} className="text-f4-gold" /> Pitch de Vendas F4
            </h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6 italic relative z-10">
              "Quero ajudar famílias com patrimônio a partir de R$ X que querem organizar e proteger patrimônio. Quem você conhece que vive isso hoje e valoriza independência?"
            </p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
              <p className="text-xs font-bold text-f4-gold uppercase tracking-widest mb-2">Dica de Ouro</p>
              <p className="text-xs text-slate-200 font-medium">Apresente a F4 de maneira simples: Preservar, Crescer e Perpetuar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
