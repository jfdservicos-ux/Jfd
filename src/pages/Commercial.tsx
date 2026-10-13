import { useState } from 'react';
import { 
  FileText, 
  Send, 
  Printer, 
  Share2, 
  MessageSquare, 
  ChevronRight, 
  Search,
  Filter,
  Download,
  BookOpen,
  Target,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Calculator,
  Scale,
  Gavel,
  Info,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProposalGenerator from '../components/ProposalGenerator';
import { cn } from '../lib/utils';

interface CommercialProps {
  profile: any;
}

const OBJECTIONS = [
  {
    title: '“Já invisto há anos”',
    responses: [
      'Excelente. Isso demonstra experiência. O papel da F4 é organizar critérios para que essa experiência continue fazendo sentido ao longo do tempo.',
      'Muitos clientes experientes nos procuram exatamente para estruturar decisões, não para substituí-las.',
      'Não começamos do zero, organizamos tudo o que já foi construído.'
    ]
  },
  {
    title: '“Achei caro”',
    responses: [
      'O custo do método é visível. O custo do erro patrimonial normalmente não é.',
      'O valor está na governança contínua ao longo dos anos.',
      'Aqui o diferencial não é preço, é alinhamento e independência.'
    ]
  },
  {
    title: '“Quero começar direto pela consultoria”',
    responses: [
      'Sem planejamento não há governança, apenas acompanhamento.',
      'Planejamento define critérios, consultoria executa.',
      'Pular etapas gera retrabalho e decisões reativas.'
    ]
  },
  {
    title: '“Preciso pensar”',
    responses: [
      'Decisões patrimoniais exigem clareza, não impulso.',
      'Vamos definir o que precisa estar claro para você decidir.',
      'Definir prazo e critérios ajuda a decidir com tranquilidade.'
    ]
  }
];

const TEMPLATES = [
  {
    id: 'pf',
    title: 'Planejamento Financeiro',
    description: 'Clareza, governança e decisões patrimoniais estruturadas.',
    icon: <Target className="text-f4-gold" />,
    color: 'bg-f4-gold/10'
  },
  {
    id: 'ci',
    title: 'Consultoria de Investimentos',
    description: 'Governança contínua, independência e alinhamento total.',
    icon: <TrendingUp className="text-f4-accent" />,
    color: 'bg-f4-accent/10'
  }
];

export default function Commercial({ profile }: CommercialProps) {
  const [activeTab, setActiveTab] = useState<'proposals' | 'playbook' | 'pricing'>('proposals');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorType, setGeneratorType] = useState<'planning' | 'consulting' | 'both'>('planning');
  const [searchQuery, setSearchQuery] = useState('');
  const [complexity, setComplexity] = useState({
    family: 1,
    accounts: 1,
    realEstate: 0,
    corporate: 0,
    offshore: false,
    succession: false
  });

  const calculatePricing = () => {
    let base = 2500;
    if (complexity.family > 2) base += 1000;
    if (complexity.accounts > 3) base += 1500;
    if (complexity.realEstate > 2) base += 2000;
    if (complexity.corporate > 0) base += 3000;
    if (complexity.offshore) base += 5000;
    if (complexity.succession) base += 4000;
    return base;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-f4-blue tracking-tight">Área Comercial</h1>
          <p className="text-slate-500 font-medium mt-1">Gestão de propostas e ferramentas de conversão MOC-F4.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'proposals' ? 'bg-f4-blue text-white shadow-lg shadow-f4-blue/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} /> Propostas
          </button>
          <button 
            onClick={() => setActiveTab('playbook')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'playbook' ? 'bg-f4-blue text-white shadow-lg shadow-f4-blue/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={18} /> Playbook de Objeções
          </button>
          <button 
            onClick={() => setActiveTab('pricing')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'pricing' ? 'bg-f4-blue text-white shadow-lg shadow-f4-blue/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calculator size={18} /> Guia de Precificação
          </button>
        </div>
      </header>

      {activeTab === 'proposals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates Selection */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2">
              <Sparkles size={24} className="text-f4-gold" /> Gerador de Propostas
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setGeneratorType('planning');
                  setIsGeneratorOpen(true);
                }}
                className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-f4-blue/20 transition-all text-left group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-f4-gold/10 transition-transform group-hover:scale-110">
                    <Target className="text-f4-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-f4-blue">Planejamento Financeiro</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Modelo editável com escopo e valores personalizados.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setGeneratorType('consulting');
                  setIsGeneratorOpen(true);
                }}
                className="w-full p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-f4-blue/20 transition-all text-left group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-f4-accent/10 transition-transform group-hover:scale-110">
                    <TrendingUp className="text-f4-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-f4-blue">Consultoria de Investimentos</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Modelo institucional com taxas e governança.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setGeneratorType('both');
                  setIsGeneratorOpen(true);
                }}
                className="w-full p-6 rounded-3xl border-2 border-f4-blue/10 bg-f4-blue/5 hover:border-f4-blue/20 transition-all text-left group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-f4-blue text-white transition-transform group-hover:scale-110">
                    <Shield className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-f4-blue">Gestão Patrimonial 360°</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Proposta completa unindo planejamento e consultoria.</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="glass-card p-8 rounded-3xl bg-f4-blue text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Dica do Mentor</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "Uma proposta elegante não vende apenas números, vende segurança e governança. Use os modelos institucionais para manter o padrão MFO."
                </p>
              </div>
              <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
            </div>
          </div>

          {/* Recent Proposals / Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-f4-blue">Propostas Recentes</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente..."
                    className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-f4-blue outline-none transition-all w-64"
                  />
                </div>
                <button className="p-2 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { client: 'Ricardo Mendes', type: 'Planejamento', date: 'Hoje, 14:30', status: 'Pendente', value: 'R$ 4.500' },
                { client: 'Família Oliveira', type: 'Consultoria', date: 'Ontem, 10:15', status: 'Enviada', value: '0,80% a.a.' },
                { client: 'Beatriz Santos', type: 'Gestão 360°', date: '28 Mar, 16:45', status: 'Aceita', value: 'R$ 12.000' },
              ].map((prop, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 rounded-3xl border border-slate-100 bg-white hover:border-f4-blue/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-f4-blue group-hover:bg-f4-blue group-hover:text-white transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-f4-blue">{prop.client}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <span>{prop.type}</span>
                          <span>•</span>
                          <span>{prop.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-f4-blue">{prop.value}</p>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          prop.status === 'Aceita' ? 'text-emerald-500' : 
                          prop.status === 'Enviada' ? 'text-f4-accent' : 'text-slate-400'
                        )}>{prop.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-f4-blue">Crie uma Proposta de Impacto</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                  Utilize o gerador ao lado para criar documentos personalizados que seguem o padrão institucional da F4.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'playbook' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-3xl bg-f4-blue text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield size={28} className="text-f4-gold" /> Método F4 – LAER+
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Ouvir sem interromper', desc: 'Deixe o cliente esvaziar a preocupação.' },
                  { step: '2', title: 'Validar a preocupação', desc: 'Mostre que você entendeu o ponto dele.' },
                  { step: '3', title: 'Explorar a raiz', desc: 'Pergunte o porquê daquela dúvida.' },
                  { step: '4', title: 'Responder com método', desc: 'Use a governança F4 como defesa.' },
                  { step: '5', title: 'Próximo passo claro', desc: 'Nunca termine sem um compromisso.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-f4-gold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-2">
                <AlertCircle size={24} className="text-rose-500" /> Postura & Compliance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Nunca</p>
                  <p className="text-xs font-bold text-rose-900">Prometer Retorno</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Nunca</p>
                  <p className="text-xs font-bold text-rose-900">Atacar Concorrentes</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Nunca</p>
                  <p className="text-xs font-bold text-rose-900">Pressionar Decisões</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2">
              <MessageSquare size={24} className="text-f4-accent" /> Objeções Comuns
            </h3>
            <div className="space-y-4">
              {OBJECTIONS.map((obj, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl space-y-4">
                  <h4 className="font-bold text-f4-blue flex items-center justify-between">
                    {obj.title}
                    <ChevronRight size={16} className="text-slate-300" />
                  </h4>
                  <div className="space-y-3">
                    {obj.responses.map((resp, j) => (
                      <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic text-slate-600">
                        "{resp}"
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-f4-blue text-white rounded-2xl">
                  <Calculator size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-f4-blue">Calculadora de Complexidade</h3>
                  <p className="text-slate-500 font-medium">Oriente sua precificação com base no esforço técnico</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Núcleos Familiares</label>
                    <input 
                      type="number" 
                      min="1"
                      value={complexity.family}
                      onChange={(e) => setComplexity({...complexity, family: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instituições Financeiras</label>
                    <input 
                      type="number" 
                      min="1"
                      value={complexity.accounts}
                      onChange={(e) => setComplexity({...complexity, accounts: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imóveis / Ativos Reais</label>
                    <input 
                      type="number" 
                      min="0"
                      value={complexity.realEstate}
                      onChange={(e) => setComplexity({...complexity, realEstate: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-f4-blue" />
                      <span className="text-sm font-bold text-slate-700">Holdings / PJ</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={complexity.corporate > 0}
                      onChange={(e) => setComplexity({...complexity, corporate: e.target.checked ? 1 : 0})}
                      className="w-6 h-6 rounded-lg border-slate-300 text-f4-blue focus:ring-f4-blue"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-f4-blue" />
                      <span className="text-sm font-bold text-slate-700">Ativos Offshore</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={complexity.offshore}
                      onChange={(e) => setComplexity({...complexity, offshore: e.target.checked})}
                      className="w-6 h-6 rounded-lg border-slate-300 text-f4-blue focus:ring-f4-blue"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Scale size={20} className="text-f4-blue" />
                      <span className="text-sm font-bold text-slate-700">Planejamento Sucessório</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={complexity.succession}
                      onChange={(e) => setComplexity({...complexity, succession: e.target.checked})}
                      className="w-6 h-6 rounded-lg border-slate-300 text-f4-blue focus:ring-f4-blue"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-f4-blue rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-f4-gold text-[10px] font-black uppercase tracking-widest mb-1">Fee Sugerido (Setup)</p>
                  <h4 className="text-4xl font-bold">R$ {calculatePricing().toLocaleString('pt-BR')}</h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300 font-medium max-w-xs">
                    Este valor é uma sugestão baseada no MOC-F4 para garantir a sustentabilidade da operação e qualidade técnica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-[#0A192F] text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Info size={24} className="text-f4-gold" /> Níveis de Serviço
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <h4 className="font-bold text-f4-gold text-sm mb-1">Essencial</h4>
                  <p className="text-xs text-slate-400">Patrimônio até R$ 2M. Foco em organização e fluxo de caixa.</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <h4 className="font-bold text-f4-gold text-sm mb-1">Wealth</h4>
                  <p className="text-xs text-slate-400">Patrimônio R$ 2M a R$ 10M. Foco em diversificação e eficiência fiscal.</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <h4 className="font-bold text-f4-gold text-sm mb-1">Family Office</h4>
                  <p className="text-xs text-slate-400">Patrimônio acima de R$ 10M. Foco em governança familiar e sucessão.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProposalGenerator 
        isOpen={isGeneratorOpen} 
        onClose={() => setIsGeneratorOpen(false)} 
        initialType={generatorType}
        profile={profile}
      />
    </div>
  );
}
