import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Save,
  X,
  History,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ACTIVITIES } from '../mockData';

export default function Activities() {
  const [activities, setActivities] = useState<any[]>(MOCK_ACTIVITIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newActivity, setNewActivity] = useState({
    type: 'Diagnóstico',
    notes: '',
    clientName: '',
    mdc: 'Planejamento Financeiro'
  });

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.notes.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (act.clientName && act.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || act.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const activity = {
      id: `act-${Date.now()}`,
      ...newActivity,
      date: { seconds: Date.now() / 1000 }
    };
    setActivities([activity, ...activities]);
    setShowAddModal(false);
    setNewActivity({ type: 'Diagnóstico', notes: '', clientName: '', mdc: 'Planejamento Financeiro' });
  };

  const activityTypes = [
    'Diagnóstico',
    '1-a-1',
    'Proposta',
    'Fechamento',
    'Pós-Venda',
    'Follow-up'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-f4-blue tracking-tight">Log de Atividades</h1>
          <p className="text-slate-500 font-medium mt-1">O GPS biológico do Banker de Alta Performance.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-f4-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-xl shadow-f4-blue/20"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-blue">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total na Semana</p>
          <h3 className="text-2xl font-bold text-f4-blue">24 Atividades</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> +15% vs semana anterior
          </p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-gold">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Diária</p>
          <h3 className="text-2xl font-bold text-f4-blue">4.8 / dia</h3>
          <p className="text-xs text-slate-400 font-bold mt-2">Meta MOC-F4: 3.0 / dia</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-accent">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversão de Etapa</p>
          <h3 className="text-2xl font-bold text-f4-blue">62%</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 size={14} /> Alta Performance
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por cliente ou notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-f4-blue/5 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
              filterType === 'all' ? 'bg-f4-blue text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          {activityTypes.map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                filterType === type ? 'bg-f4-blue text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, i) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 group hover:border-f4-gold/30 transition-all"
            >
              <div className="flex items-center gap-4 md:w-48 shrink-0">
                <div className="p-3 bg-f4-blue/5 text-f4-blue rounded-2xl group-hover:bg-f4-blue group-hover:text-white transition-all">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                  <p className="text-sm font-bold text-f4-blue">
                    {new Date(activity.date.seconds * 1000).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    activity.type === 'Fechamento' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'Proposta' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.type}
                  </span>
                  {activity.clientName && (
                    <span className="text-sm font-bold text-f4-blue">• {activity.clientName}</span>
                  )}
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{activity.notes}</p>
              </div>

              <div className="flex items-center gap-4 md:w-48 shrink-0 md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MDC Relacionado</p>
                  <p className="text-xs font-bold text-f4-gold">{activity.mdc || 'Geral'}</p>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-f4-blue transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2 border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
              <History size={40} />
            </div>
            <h3 className="text-xl font-bold text-f4-blue">Nenhuma atividade encontrada</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Tente ajustar seus filtros ou registre uma nova atividade para começar.</p>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-f4-blue/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 bg-f4-blue text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Novo Registro de Atividade</h2>
                  <p className="text-f4-gold text-[10px] font-black uppercase tracking-widest mt-1">Alimentando o Método MOC-F4</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="hover:bg-white/10 p-3 rounded-2xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddActivity} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Atividade</label>
                  <select 
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue transition-all appearance-none"
                  >
                    {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MDC Relacionado</label>
                  <select 
                    value={newActivity.mdc}
                    onChange={(e) => setNewActivity({ ...newActivity, mdc: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue transition-all appearance-none"
                  >
                    <option value="Planejamento Financeiro">Planejamento Financeiro</option>
                    <option value="Consultoria de Investimentos (AUM)">Consultoria de Investimentos (AUM)</option>
                    <option value="Consórcios Inteligente">Consórcios Inteligente</option>
                    <option value="Investimentos Globais">Investimentos Globais</option>
                    <option value="Seguros">Seguros</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Prospect (Opcional)</label>
                  <input 
                    type="text"
                    placeholder="Nome do cliente..."
                    value={newActivity.clientName}
                    onChange={(e) => setNewActivity({ ...newActivity, clientName: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-bold text-f4-blue transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas / Observações</label>
                  <textarea 
                    required
                    placeholder="O que aconteceu nesta atividade? Quais os próximos passos?"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm min-h-[120px] transition-all"
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-f4-blue text-white py-5 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-xl shadow-f4-blue/30 flex items-center justify-center gap-3 text-lg"
                  >
                    <Save size={22} /> Consolidar Atividade no MOC
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
