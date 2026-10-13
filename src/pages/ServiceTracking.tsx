import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Filter,
  TrendingUp,
  Target,
  Zap,
  Briefcase,
  User,
  Calendar,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ServiceTracking({ profile }: { profile: any }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  useEffect(() => {
    if (!profile?.uid) return;

    let servicesQuery;
    if (isManager) {
      servicesQuery = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    } else {
      servicesQuery = query(
        collection(db, 'services'), 
        where('bankerUid', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      setLoading(false);
    }, (error) => {
      console.error("Service Tracking Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid, isManager]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-100 text-emerald-600';
      case 'Em Execução': return 'bg-blue-100 text-blue-600';
      case 'Aguardando Documentos': return 'bg-amber-100 text-amber-600';
      case 'Suspenso': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-f4-blue tracking-tight">Acompanhamento de Serviços</h1>
          <p className="text-slate-500 font-medium mt-1">Pós-Venda e Gestão de Entregas MOC-F4.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="px-4 py-2 bg-f4-blue text-white rounded-xl text-sm font-bold">Retenção: 98%</div>
          <div className="px-4 py-2 text-slate-500 text-sm font-semibold">LTV: R$ 45k</div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border-l-4 border-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviços Ativos</p>
          <h3 className="text-2xl font-bold text-f4-blue">{services.length}</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> +2 este mês
          </p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-l-4 border-blue-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Execução</p>
          <h3 className="text-2xl font-bold text-f4-blue">
            {services.filter(s => s.status === 'Em Execução').length}
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-2">Foco na Entrega</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-l-4 border-amber-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendências</p>
          <h3 className="text-2xl font-bold text-f4-blue">
            {services.filter(s => s.status === 'Aguardando Documentos').length}
          </h3>
          <p className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1">
            <AlertCircle size={14} /> Requer Atenção
          </p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-gold">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NPS Médio</p>
          <h3 className="text-2xl font-bold text-f4-blue">9.4</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 size={14} /> Excelência F4
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-f4-blue/5 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'Ativo', 'Em Execução', 'Aguardando Documentos', 'Suspenso'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                filterStatus === status ? 'bg-f4-blue text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-f4-blue border-t-f4-gold rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-500 font-bold">Carregando serviços...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service, i) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-8 rounded-[2.5rem] group hover:border-f4-gold/30 transition-all relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                <div className="flex items-center gap-6 lg:w-1/3">
                  <div className="w-16 h-16 rounded-2xl bg-f4-blue text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-f4-blue/20">
                    {service.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-f4-blue">{service.clientName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase size={14} className="text-f4-gold" />
                      <p className="text-sm font-bold text-slate-500">{service.serviceType}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso da Entrega</p>
                    <p className="text-sm font-bold text-f4-blue">{service.progress}%</p>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${service.progress}%` }}
                      className={`h-full ${service.progress === 100 ? 'bg-emerald-500' : 'bg-f4-blue'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock size={14} />
                    <span>Próximo Passo: <span className="text-f4-blue">{service.nextStep}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-8 lg:w-1/4 lg:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-f4-blue group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-f4-blue">Nenhum serviço em acompanhamento</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Use o botão de "Seed Data" no Dashboard para carregar dados de teste.</p>
          </div>
        )}
      </div>

      {/* Mentor Guidance */}
      <div className="bg-[#0A192F] text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <Zap size={200} />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-f4-gold rounded-2xl">
                <BarChart3 className="text-f4-blue" size={24} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Governança Pós-Venda</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed font-medium italic border-l-4 border-f4-gold pl-6">
              "A venda é o início do relacionamento, não o fim. O MOC-F4 exige uma cadência de revisão trimestral para garantir que o LTV (Lifetime Value) do cliente seja maximizado através da confiança."
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-f4-gold uppercase tracking-widest mb-1">Retenção Alvo</p>
                <p className="text-xl font-bold">95%+</p>
              </div>
              <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-f4-gold uppercase tracking-widest mb-1">Indicações / Cliente</p>
                <p className="text-xl font-bold">2.4</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-f4-gold mb-4">Checklist de Revisão Trimestral</h3>
            {[
              'Validar se os objetivos (Goals) mudaram',
              'Revisar performance da carteira vs Benchmark',
              'Atualizar GAINS do cliente',
              'Solicitar novas indicações (PCI)',
              'Verificar oportunidades de Cross-Sell (MDCs)'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
