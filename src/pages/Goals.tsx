import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  Save, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Briefcase,
  DollarSign,
  Calculator,
  Zap,
  Info,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../firebase';
import { RATINGS, MDCs } from '../constants';
import { useNotification } from '../components/NotificationProvider';

interface GoalsProps {
  profile: any;
}

const QUARTERS = [
  { id: 'q1', label: '1º Trimestre' },
  { id: 'q2', label: '2º Trimestre' },
  { id: 'q3', label: '3º Trimestre' },
  { id: 'q4', label: '4º Trimestre' }
];

const getCommissionRate = (rating: string) => {
  const rate = RATINGS.find(r => r.id === rating);
  return rate ? rate.commission : 0.50;
};

export default function Goals({ profile }: GoalsProps) {
  const { notify } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState('q1');
  const [mdcGoals, setMdcGoals] = useState<any[]>(() => {
    const savedGoals = profile.mdcGoals || [];
    return MDCs.map(mdc => {
      const saved = savedGoals.find((g: any) => g.id === mdc.id);
      return { ...mdc, targetEarnings: saved ? String(saved.targetEarnings) : '0' };
    });
  });
  const [leadMix, setLeadMix] = useState(profile.leadMix || 0.5); // 50% qualified, 50% cold

  useEffect(() => {
    if (!isEditing) {
      const savedGoals = profile.mdcGoals || [];
      setMdcGoals(MDCs.map(mdc => {
        const saved = savedGoals.find((g: any) => g.id === mdc.id);
        return { ...mdc, targetEarnings: saved ? String(saved.targetEarnings) : '0' };
      }));
      if (profile.leadMix !== undefined) setLeadMix(profile.leadMix);
    }
  }, [profile.mdcGoals, profile.leadMix, isEditing]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const calculateEffort = () => {
    let totalTargetEarnings = 0;
    let totalDiagnostics = 0;
    let totalMeetings = 0;
    let totalLeads = 0;

    const commissionRate = getCommissionRate(profile.rating || 'Caa2');

    mdcGoals.forEach(goal => {
      const targetEarningsNum = Number(goal.targetEarnings) || 0;
      totalTargetEarnings += targetEarningsNum;
      
      // How much revenue is needed to reach target earnings?
      // targetEarnings = revenue * commissionRate
      // revenue = targetEarnings / commissionRate
      const revenueNeeded = targetEarningsNum / commissionRate;
      
      // How many sales needed?
      // For PF, unitRevenue is 2400. For CO, it's 9000.
      const unitRev = goal.id === 'co' ? 9000 : (goal.id === 'pf' ? 2400 : 12000);
      const salesNeeded = revenueNeeded / unitRev;
      
      // Weighted conversion rate
      const weightedConv = (goal.convQual * leadMix) + (goal.convCold * (1 - leadMix));
      
      const leadsNeeded = salesNeeded / weightedConv;
      const diagnosticsNeeded = leadsNeeded * 0.7; // 70% of leads become diagnostics
      const meetingsNeeded = leadsNeeded * 1.5; // 1.5 meetings per lead on average

      totalLeads += Math.ceil(leadsNeeded);
      totalDiagnostics += Math.ceil(diagnosticsNeeded);
      totalMeetings += Math.ceil(meetingsNeeded);
    });

    return { 
      totalTargetEarnings, 
      totalDiagnostics, 
      totalMeetings, 
      totalLeads,
      weeklyEarnings: totalTargetEarnings / 12,
      weeklyDiagnostics: totalDiagnostics / 12,
      weeklyMeetings: totalMeetings / 12,
      weeklyLeads: totalLeads / 12
    };
  };

  const effort = calculateEffort();

  const handleSaveGoals = async () => {
    setIsSaving(true);
    try {
      const goalsToSave = mdcGoals.map(g => ({
        id: g.id,
        targetEarnings: Number(g.targetEarnings) || 0
      }));

      if (profile.uid !== 'dev-user') {
        await updateDoc(doc(db, 'users', profile.uid), {
          mdcGoals: goalsToSave,
          selectedQuarter,
          leadMix,
          monthlyGoals: {
            earnings: effort.totalTargetEarnings,
            diagnostics: effort.totalDiagnostics,
            meetings: effort.totalMeetings,
            leads: effort.totalLeads
          },
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      notify('success', 'Metas salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      notify('error', 'Erro ao salvar metas.');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { 
      label: 'Ganhos Alvo', 
      current: 0, 
      target: effort.totalTargetEarnings, 
      weekly: effort.weeklyEarnings,
      icon: <DollarSign className="text-emerald-500" />,
      color: 'bg-emerald-500/10'
    },
    { 
      label: 'Leads Necessários', 
      current: 0, 
      target: effort.totalLeads, 
      weekly: effort.weeklyLeads,
      icon: <Users className="text-f4-blue" />,
      color: 'bg-f4-blue/10'
    },
    { 
      label: 'Diagnósticos', 
      current: 0, 
      target: effort.totalDiagnostics, 
      weekly: effort.weeklyDiagnostics,
      icon: <Target className="text-rose-500" />,
      color: 'bg-rose-500/10'
    },
    { 
      label: 'Reuniões 1-a-1', 
      current: 0, 
      target: effort.totalMeetings, 
      weekly: effort.weeklyMeetings,
      icon: <Calendar className="text-f4-gold" />,
      color: 'bg-f4-gold/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-f4-blue tracking-tight">Metas & Performance</h1>
          <p className="text-slate-500 font-medium mt-1">Acompanhamento estratégico de crescimento MOC-F4.</p>
        </div>
        <div className="flex gap-4">
          {isEditing && (
            <div className="flex gap-4">
              <select 
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-f4-blue outline-none focus:ring-2 focus:ring-f4-blue/10"
              >
                {QUARTERS.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
              </select>
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Mix de Leads:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={leadMix}
                  onChange={(e) => setLeadMix(Number(e.target.value))}
                  className="w-32 accent-f4-gold"
                />
                <span className="text-xs font-bold text-f4-blue">{Math.round(leadMix * 100)}% Qualif.</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => isEditing ? handleSaveGoals() : setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
              isSaving ? 'bg-slate-400 cursor-not-allowed' :
              isEditing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-f4-blue text-white shadow-lg shadow-f4-blue/20 hover:bg-f4-accent'
            }`}
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEditing ? <Save size={20} /> : <Target size={20} />)}
            {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Planejamento' : 'Ajustar Metas')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl border-l-4 border-f4-blue"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg">Trimestral</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-f4-blue">
              {stat.label.includes('Ganhos') 
                ? formatCurrency(stat.target) 
                : stat.target}
            </h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={`weekly-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.1 }}
            className="glass-card p-6 rounded-3xl border-l-4 border-f4-gold"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold text-f4-gold uppercase bg-f4-gold/10 px-2 py-1 rounded-lg">Semanal</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label} (Semana)</p>
            <h4 className="text-2xl font-bold text-f4-accent">
              {stat.label.includes('Ganhos') 
                ? formatCurrency(stat.weekly) 
                : Math.ceil(stat.weekly)}
            </h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-f4-blue mb-8 flex items-center gap-2">
              <TrendingUp size={24} className="text-f4-gold" /> Planejamento de Esforço Trimestral
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-f4-blue text-white rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Leads Qualificados ({Math.round(leadMix * 100)}%)</p>
                    <p className="text-xl font-bold text-f4-blue">{Math.ceil(effort.totalLeads * leadMix)} leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Leads Frios ({Math.round((1 - leadMix) * 100)}%)</p>
                  <p className="text-xl font-bold text-f4-blue">{Math.ceil(effort.totalLeads * (1 - leadMix))} leads</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-xs font-bold text-rose-400 uppercase mb-1">Taxa de Conversão Média</p>
                  <p className="text-3xl font-bold text-rose-600">
                    {Math.round((effort.totalLeads > 0 ? (effort.totalTargetEarnings / (effort.totalLeads * 10000)) : 0) * 100)}%
                  </p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Repasse Banker (Rating {profile.rating || 'Caa2'})</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {Math.round(getCommissionRate(profile.rating || 'Caa2') * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-f4-blue mb-8 flex items-center gap-2">
              <BarChart3 size={24} className="text-f4-accent" /> Distribuição de Metas por MDC
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mdcGoals.filter(g => g.targetEarnings > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="targetEarnings"
                    nameKey="label"
                  >
                    {mdcGoals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#002B49', '#C5A059', '#F27D26'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Goal Settings */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-2">
              <Calculator size={24} className="text-f4-blue" /> Quanto quero ganhar?
            </h3>
            <div className="space-y-6">
              {mdcGoals.map((goal, idx) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {goal.label}
                    </label>
                    <span className="text-[10px] font-bold text-f4-gold">{goal.unitLabel}</span>
                  </div>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input 
                        type="number"
                        value={goal.targetEarnings}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newGoals = mdcGoals.map((g, i) => 
                            i === idx ? { ...g, targetEarnings: val } : g
                          );
                          setMdcGoals(newGoals);
                        }}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-f4-blue">
                        {formatCurrency(goal.targetEarnings)}
                      </span>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl bg-[#0A192F] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap size={100} />
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-f4-gold" /> Resumo do Esforço
            </h3>
            <div className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400">Leads Totais</span>
                <span className="font-bold text-f4-gold">{effort.totalLeads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400">Diagnósticos</span>
                <span className="font-bold text-f4-gold">{effort.totalDiagnostics}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400">Reuniões 1-a-1</span>
                <span className="font-bold text-f4-gold">{effort.totalMeetings}</span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-2">Ganhos Totais Trimestre</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(effort.totalTargetEarnings)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
