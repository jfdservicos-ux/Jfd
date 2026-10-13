import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Calendar, 
  ChevronRight,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
  Lightbulb,
  Info,
  Plus,
  Save,
  Clock,
  ExternalLink,
  BookOpen,
  X,
  Database,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_LEADS, MOCK_ACTIVITIES, NEURO_INSIGHTS } from '../mockData';
import { seedTestData, clearTestData } from '../lib/seed';
import Alerts from '../components/Alerts';
import { useNotification } from '../components/NotificationProvider';

interface DashboardProps {
  profile: any;
}

export default function Dashboard({ profile }: DashboardProps) {
  const { notify, confirm: customConfirm } = useNotification();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>(MOCK_LEADS);
  const [activities, setActivities] = useState<any[]>(MOCK_ACTIVITIES);
  const [showMentor, setShowMentor] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: 'Diagnóstico', notes: '' });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  const handleSeedData = async () => {
    if (!profile?.uid) return;
    setIsSeeding(true);
    try {
      await seedTestData(profile.uid);
      notify('success', 'Dados de teste gerados com sucesso! Recarregue a página para ver as mudanças.');
    } catch (error) {
      notify('error', 'Erro ao gerar dados de teste.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = await customConfirm({
      title: 'Limpar Dados',
      message: 'Tem certeza que deseja limpar TODOS os dados de teste? Isso removerá leads, atividades e serviços de todos os bankers.',
      confirmText: 'Limpar Tudo',
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    setIsClearing(true);
    try {
      await clearTestData();
      notify('success', 'Dados limpos com sucesso! Recarregue a página.');
    } catch (error) {
      notify('error', 'Erro ao limpar dados.');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    if (!profile?.uid || profile.uid === 'dev-user') return;

    const leadsQuery = query(collection(db, 'leads'), where('bankerUid', '==', profile.uid));
    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      if (!snapshot.empty) setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const activitiesQuery = query(
      collection(db, 'activities'), 
      where('bankerUid', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      if (!snapshot.empty) setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeLeads();
      unsubscribeActivities();
    };
  }, [profile?.uid]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingActivity(true);
    try {
      const activity = {
        id: `act-${Date.now()}`,
        type: newActivity.type,
        notes: newActivity.notes,
        date: { seconds: Date.now() / 1000 }
      };
      setActivities([activity, ...activities]);
      setShowLogModal(false);
      setNewActivity({ type: 'Diagnóstico', notes: '' });
    } finally {
      setIsSavingActivity(false);
    }
  };

  const isManager = profile?.role === 'admin' || profile?.role === 'manager';
  const [officeStats, setOfficeStats] = useState({ totalAum: 0, totalLeads: 0, activeBankers: 0 });
  const [bankers, setBankers] = useState<any[]>([]);

  useEffect(() => {
    if (!isManager) return;

    const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const totalAum = snapshot.docs.reduce((acc, doc) => acc + (doc.data().mdcValue || 0), 0);
      setOfficeStats(prev => ({ ...prev, totalAum, totalLeads: snapshot.size }));
    });

    const unsubscribeBankers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'banker')), (snapshot) => {
      const bankerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBankers(bankerList);
      setOfficeStats(prev => ({ ...prev, activeBankers: snapshot.size }));
    });

    return () => {
      unsubscribeLeads();
      unsubscribeBankers();
    };
  }, [isManager]);

  const stats = isManager ? [
    { label: 'AUM Escritório', value: `R$ ${officeStats.totalAum.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Bankers Ativos', value: officeStats.activeBankers, icon: Users, color: 'text-f4-blue', bg: 'bg-f4-blue/5' },
    { label: 'Leads Totais', value: officeStats.totalLeads, icon: Target, color: 'text-f4-gold', bg: 'bg-f4-gold/10' },
    { label: 'Performance Global', value: '92%', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ] : [
    { label: 'AUM Total', value: `R$ ${(profile?.aum || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rating Atual', value: profile?.rating || 'Caa2', icon: Target, color: 'text-f4-gold', bg: 'bg-f4-gold/10' },
    { label: 'Leads Ativos', value: leads.length, icon: Users, color: 'text-f4-blue', bg: 'bg-f4-blue/5' },
    { label: 'MOC-F4 Score', value: '8.5', icon: Zap, color: 'text-f4-gold', bg: 'bg-f4-gold/10' },
    { label: 'Meta Mensal', value: `${((leads.filter(l => l.stage === 'won').length / (profile?.monthlyGoals?.revenue || 1)) * 100).toFixed(0)}%`, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const chartData = [
    { name: 'Jan', aum: 12000000 },
    { name: 'Fev', aum: 15000000 },
    { name: 'Mar', aum: 18500000 },
    { name: 'Abr', aum: 22000000 },
    { name: 'Mai', aum: 25000000 },
    { name: 'Jun', aum: 30000000 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-f4-blue tracking-tight">
            {isManager ? 'Painel de Gestão Master' : 'Dashboard de Performance'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isManager ? 'Visão consolidada do escritório' : `Bem-vindo ao Modo Mentor, ${profile?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMentor(!showMentor)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              showMentor ? 'bg-f4-gold text-f4-blue' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            <Brain size={18} /> Modo Mentor {showMentor ? 'ON' : 'OFF'}
          </button>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="px-4 py-2 bg-f4-blue text-white rounded-xl text-sm font-bold">MOC-F4 Ativo</div>
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold">Março 2026</div>
          </div>
        </div>
      </header>

      {/* Alerts Section */}
      <Alerts profile={profile} />

      {/* Mentor Guidance Section - REVISED VISUALS */}
      <AnimatePresence>
        {showMentor && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Mentor Card */}
            <div className="lg:col-span-2 bg-[#0A192F] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-f4-gold rounded-2xl">
                    <Brain className="text-f4-blue" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mentor MOC-F4</h2>
                    <p className="text-f4-gold text-[10px] font-black uppercase tracking-[0.2em]">Cadência de Alta Performance</p>
                  </div>
                </div>
                <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8 italic border-l-4 border-f4-gold pl-6">
                  "A neurociência explica que a consistência (hábito) é mais potente que a intensidade esporádica. O Log de Atividades é o seu GPS biológico."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
                    <p className="text-[10px] font-black text-f4-gold uppercase tracking-[0.2em] mb-2 group-hover:translate-x-1 transition-transform">Hábito Diário</p>
                    <p className="text-sm font-bold">Logar 3 atividades/dia</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
                    <p className="text-[10px] font-black text-f4-gold uppercase tracking-[0.2em] mb-2 group-hover:translate-x-1 transition-transform">Foco no Cliente</p>
                    <p className="text-sm font-bold">Atualizar 2 GAINS/dia</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
                    <p className="text-[10px] font-black text-f4-gold uppercase tracking-[0.2em] mb-2 group-hover:translate-x-1 transition-transform">Governança</p>
                    <p className="text-sm font-bold">Scorecard Semanal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banker's Guide - Priority Actions */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
              <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-3">
                <Zap className="text-f4-gold" size={24} /> Guia do Banker
              </h3>
              <div className="space-y-3 flex-1">
                {[
                  { label: 'Revisar Pipeline CRM', path: '/crm', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Gerar Nova Proposta', path: '/commercial', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Acompanhar Serviços', path: '/tracking', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Estudar Playbook F4', path: '/academy', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Ver Metas do Mês', path: '/goals', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((action, i) => (
                  <Link 
                    key={i}
                    to={action.path}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${action.bg} ${action.color}`}>
                        <action.icon size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{action.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setShowLogModal(true)}
                  className="w-full bg-f4-blue text-white py-4 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Informar Log de Atividade
                </button>
                <button 
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="w-full bg-white text-f4-blue border-2 border-f4-blue/10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Database size={20} className="text-f4-gold" /> 
                  {isSeeding ? 'Gerando dados...' : 'Gerar Dados de Teste (Seed)'}
                </button>
                {isManager && (
                  <button 
                    onClick={handleClearData}
                    disabled={isClearing}
                    className="w-full bg-white text-rose-500 border-2 border-rose-100 py-4 rounded-2xl font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X size={20} /> 
                    {isClearing ? 'Limpando...' : 'Limpar Dados de Teste'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center text-emerald-500 text-xs font-bold">
                <ArrowUpRight size={14} />
                <span>12%</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-f4-blue">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-3">
              <BarChart3 className="text-f4-gold" /> Performance por Banker (Semana)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankers.map(b => ({ name: b.name.split(' ')[0], leads: Math.floor(Math.random() * 10) + 2, diagnostics: Math.floor(Math.random() * 5) + 1 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="leads" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Leads" />
                  <Bar dataKey="diagnostics" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Diagnósticos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-3">
              <TrendingUp className="text-f4-gold" /> Evolução de AUM do Escritório (Trimestre)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Jan', aum: 45000000 },
                  { name: 'Fev', aum: 52000000 },
                  { name: 'Mar', aum: 68000000 },
                ]}>
                  <defs>
                    <linearGradient id="colorOfficeAum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(v) => `R$ ${v/1000000}M`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="aum" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorOfficeAum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MOC-F4 Scorecard - Conversion Funnel */}
      <div className="glass-card p-8 rounded-[2.5rem] border-l-8 border-f4-blue">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-f4-blue tracking-tight">MOC-F4 Scorecard</h3>
            <p className="text-slate-500 font-medium text-sm">A matemática por trás da sua meta</p>
          </div>
          <div className="p-3 bg-f4-blue/5 text-f4-blue rounded-2xl">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1-a-1 → Diagnóstico</span>
              <span className="text-sm font-bold text-f4-blue">50% Meta</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                className="h-full bg-f4-blue"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Atual: 45% (-5%)</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico → Proposta</span>
              <span className="text-sm font-bold text-f4-blue">70% Meta</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Atual: 75% (+5%)</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposta → Fechamento</span>
              <span className="text-sm font-bold text-f4-blue">40% Meta</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '38%' }}
                className="h-full bg-f4-gold"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Atual: 38% (-2%)</p>
          </div>
        </div>
      </div>

      {/* Neuro-Insights Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-f4-blue tracking-tight mb-8 flex items-center gap-3">
              <Zap className="text-f4-gold" /> Neuro-Insights: Por que o MOC funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEURO_INSIGHTS.map((insight, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-f4-gold/30 transition-all">
                  <h4 className="font-bold text-f4-blue mb-2 flex items-center gap-2">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {insight.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AUM Growth Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-f4-blue tracking-tight">Crescimento de AUM</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} tickFormatter={(v) => `R$ ${v/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A192F', border: 'none', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="aum" stroke="#1E3A8A" strokeWidth={4} fillOpacity={1} fill="url(#colorAum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Recent Activities */}
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-f4-blue tracking-tight mb-8">Log de Atividades</h3>
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-f4-blue">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-f4-blue text-sm">{activity.type}</h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{activity.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Tip Card */}
          <div className="glass-card p-8 rounded-3xl bg-[#0A192F] text-white border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Info size={100} />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-f4-gold rounded-lg">
                <Lightbulb size={20} className="text-f4-blue" />
              </div>
              Dica de Ouro
            </h3>
            <p className="text-slate-300 leading-relaxed font-medium text-sm mb-8 relative z-10">
              "O cérebro humano odeia incerteza. Ao mapear o GAINS do seu cliente, você está removendo a incerteza da relação e criando um caminho biológico para o fechamento."
            </p>
            <button 
              onClick={() => navigate('/crm')}
              className="w-full bg-f4-gold text-f4-blue py-4 rounded-2xl font-bold hover:bg-white transition-all relative z-10 shadow-lg shadow-f4-gold/20"
            >
              Ver Guia GAINS
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-f4-blue/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 bg-f4-blue text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Log de Atividade</h2>
                  <p className="text-f4-gold text-[10px] font-black uppercase tracking-widest mt-1">Registro de Performance Diária</p>
                </div>
                <button onClick={() => setShowLogModal(false)} className="hover:bg-white/10 p-3 rounded-2xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddActivity} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Atividade</label>
                  <select 
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue transition-all appearance-none"
                  >
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="1-a-1">1-a-1 (Prospecção)</option>
                    <option value="Proposta">Apresentação de Proposta</option>
                    <option value="Fechamento">Fechamento</option>
                    <option value="Pós-Venda">Pós-Venda / Revisão</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas / Observações</label>
                  <textarea 
                    required
                    placeholder="O que aconteceu nesta atividade? Quais os próximos passos?"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm min-h-[120px] transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSavingActivity}
                  className={`w-full py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isSavingActivity ? 'bg-slate-400 cursor-not-allowed' : 'bg-f4-blue text-white hover:bg-f4-accent shadow-f4-blue/30'
                  }`}
                >
                  <Save size={20} /> {isSavingActivity ? 'Salvando...' : 'Salvar no Log'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
