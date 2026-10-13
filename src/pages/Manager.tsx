import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Briefcase, 
  DollarSign, 
  Target, 
  Award, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  FileText,
  Save,
  X,
  Upload,
  Edit,
  Trash2
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
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { RATINGS, MDCs } from '../constants';
import { seedTestData, clearTestData } from '../lib/seed';
import { useNotification } from '../components/NotificationProvider';

interface ManagerProps {
  profile: any;
}

export default function Manager({ profile }: ManagerProps) {
  const { notify, confirm: customConfirm } = useNotification();
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  if (!isManager) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <Shield size={40} />
        </div>
        <h2 className="text-2xl font-bold text-f4-blue mb-2">Acesso Restrito</h2>
        <p className="text-slate-500 max-w-md">Esta área é exclusiva para gestores do escritório.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bankers' | 'performance'>('dashboard');
  const [bankers, setBankers] = useState<any[]>([]);
  const [selectedBanker, setSelectedBanker] = useState<any>(null);
  const [isAddingBanker, setIsAddingBanker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBankerId, setEditingBankerId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSavingBanker, setIsSavingBanker] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [bankerForm, setBankerForm] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 'Caa2',
    aum: 0,
    role: 'banker',
    certifications: [] as string[],
    mdcPriorities: [] as string[],
    gains: { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
  });

  const [performanceNote, setPerformanceNote] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'banker'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBankers(users);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedBanker) {
      const updated = bankers.find(b => b.id === selectedBanker.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedBanker)) {
        setSelectedBanker(updated);
      }
    }
  }, [bankers, selectedBanker]);

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Rating', 'AUM', 'MDCs'];
    const csvContent = [
      headers.join(','),
      ...bankers.map(b => [
        b.name,
        b.email,
        b.phone,
        b.rating,
        b.aum,
        (b.mdcPriorities || []).join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `base_bankers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleOpenAddModal = () => {
    setEditingBankerId(null);
    resetForm();
    setIsAddingBanker(true);
  };

  const handleOpenEditModal = (banker: any) => {
    setEditingBankerId(banker.id);
    setBankerForm({
      name: banker.name || '',
      email: banker.email || '',
      phone: banker.phone || '',
      rating: banker.rating || 'Caa2',
      aum: banker.aum || 0,
      role: 'banker',
      certifications: banker.certifications || [],
      mdcPriorities: banker.mdcPriorities || [],
      gains: banker.gains || { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
    });
    setIsAddingBanker(true);
  };

  const handleSaveBanker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanker(true);
    try {
      const data = {
        ...bankerForm,
        updatedAt: serverTimestamp()
      };

      if (editingBankerId) {
        await updateDoc(doc(db, 'users', editingBankerId), data);
      } else {
        await addDoc(collection(db, 'users'), {
          ...data,
          createdAt: serverTimestamp(),
          monthlyGoals: { earnings: 0, diagnostics: 0, meetings: 0, leads: 0 }
        });
      }
      setIsAddingBanker(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingBankerId ? OperationType.UPDATE : OperationType.CREATE, 'users');
    } finally {
      setIsSavingBanker(false);
    }
  };

  const handleDeleteBanker = async (id: string) => {
    const confirmed = await customConfirm({
      title: 'Excluir Banker',
      message: 'Tem certeza que deseja excluir este banker?',
      confirmText: 'Excluir',
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      // Soft delete by changing role or just delete
      // Let's delete for now as requested by "alterar tudo"
      await updateDoc(doc(db, 'users', id), { role: 'deleted', updatedAt: serverTimestamp() });
      notify('success', 'Banker removido com sucesso.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedBanker || !performanceNote.trim()) return;
    setIsSavingNote(true);
    try {
      const newNote = {
        date: new Date().toISOString(),
        text: performanceNote,
        type: 'Performance'
      };
      
      const updatedNotes = [...(selectedBanker.performanceNotes || []), newNote];
      
      await updateDoc(doc(db, 'users', selectedBanker.id), {
        performanceNotes: updatedNotes,
        updatedAt: serverTimestamp()
      });
      
      setPerformanceNote('');
      notify('success', 'Nota salva com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSavingNote(false);
    }
  };

  const resetForm = () => {
    setBankerForm({
      name: '',
      email: '',
      phone: '',
      rating: 'Caa2',
      aum: 0,
      role: 'banker',
      certifications: [],
      mdcPriorities: [],
      gains: { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
    });
  };

  const officeStats = {
    totalAUM: bankers.reduce((acc, b) => acc + (b.aum || 0), 0),
    totalBankers: bankers.length,
    activeLeads: 145, // Mocked
    quarterlyRevenue: 1250000, // Mocked
    weeklyGrowth: 12.5
  };

  const mdcDistribution = [
    { name: 'PF', value: 45 },
    { name: 'AUM', value: 35 },
    { name: 'Consórcio', value: 20 }
  ];

  const filteredBankers = bankers.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSeedBankers = async () => {
    if (!profile?.uid) return;
    setIsSeeding(true);
    try {
      await seedTestData(profile.uid);
      notify('success', 'Dados de teste gerados com sucesso!');
    } catch (error) {
      notify('error', 'Erro ao gerar dados.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmed = await customConfirm({
      title: 'Limpar Tudo',
      message: 'Tem certeza que deseja limpar TODOS os dados de teste?',
      confirmText: 'Limpar Tudo',
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    setIsClearing(true);
    try {
      await clearTestData();
      notify('success', 'Dados limpos com sucesso!');
    } catch (error) {
      notify('error', 'Erro ao limpar dados.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleImportClients = () => {
    notify('info', 'Funcionalidade de importação de base de clientes (CSV/Excel) será integrada com o storage em breve.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-f4-blue tracking-tight">Gestão do Escritório</h1>
          <p className="text-slate-500 font-medium mt-1">Visão estratégica e acompanhamento de performance da equipe.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-f4-blue text-white shadow-lg' : 'text-slate-400 hover:text-f4-blue'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bankers')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'bankers' ? 'bg-f4-blue text-white shadow-lg' : 'text-slate-400 hover:text-f4-blue'}`}
          >
            Bankers
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'performance' ? 'bg-f4-blue text-white shadow-lg' : 'text-slate-400 hover:text-f4-blue'}`}
          >
            1-on-1 Performance
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-blue">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-f4-blue/10 text-f4-blue rounded-2xl">
                    <Briefcase size={24} />
                  </div>
                  <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                    <ArrowUpRight size={14} /> {officeStats.weeklyGrowth}%
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AUM Total Escritório</p>
                <h4 className="text-2xl font-bold text-f4-blue">{formatCurrency(officeStats.totalAUM)}</h4>
              </div>

              <div className="glass-card p-6 rounded-3xl border-l-4 border-f4-gold">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-f4-gold/10 text-f4-gold rounded-2xl">
                    <Users size={24} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Bankers</p>
                <h4 className="text-2xl font-bold text-f4-blue">{officeStats.totalBankers} Parceiros</h4>
              </div>

              <div className="glass-card p-6 rounded-3xl border-l-4 border-emerald-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <DollarSign size={24} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receita Projetada (Q)</p>
                <h4 className="text-2xl font-bold text-f4-blue">{formatCurrency(officeStats.quarterlyRevenue)}</h4>
              </div>

              <div className="glass-card p-6 rounded-3xl border-l-4 border-rose-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                    <Target size={24} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Leads Ativos</p>
                <h4 className="text-2xl font-bold text-f4-blue">{officeStats.activeLeads} Oportunidades</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2">
                    <TrendingUp size={24} className="text-f4-gold" /> Performance Semanal do Escritório
                  </h3>
                  <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-f4-blue outline-none">
                    <option>Últimos 30 dias</option>
                    <option>Último Trimestre</option>
                  </select>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Seg', revenue: 45000 },
                      { day: 'Ter', revenue: 52000 },
                      { day: 'Qua', revenue: 48000 },
                      { day: 'Qui', revenue: 61000 },
                      { day: 'Sex', revenue: 55000 },
                      { day: 'Sáb', revenue: 32000 },
                      { day: 'Dom', revenue: 28000 },
                    ]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#002B49" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#002B49" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#002B49" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-1 glass-card p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-f4-blue mb-8 flex items-center gap-2">
                  <BarChart3 size={24} className="text-f4-accent" /> Mix de MDCs (Escritório)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mdcDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {mdcDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#002B49', '#C5A059', '#F27D26'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {mdcDistribution.map((mdc, i) => (
                    <div key={mdc.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${['bg-f4-blue', 'bg-f4-gold', 'bg-f4-accent'][i]}`} />
                        <span className="text-sm font-bold text-slate-600">{mdc.name}</span>
                      </div>
                      <span className="text-sm font-black text-f4-blue">{mdc.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'bankers' && (
          <motion.div 
            key="bankers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Buscar banker por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm shadow-sm"
                  />
                </div>
                {bankers.length === 0 && (
                  <button 
                    onClick={handleSeedBankers}
                    className="flex items-center gap-2 bg-slate-100 text-slate-500 px-6 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Gerar Dados de Teste
                  </button>
                )}
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-rose-500 border border-rose-100 px-8 py-4 rounded-2xl font-bold hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50"
                >
                  <X size={20} /> {isClearing ? 'Limpando...' : 'Limpar Tudo'}
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-emerald-600 border border-emerald-100 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Upload size={20} /> Exportar Base
                </button>
                <button 
                  onClick={handleImportClients}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-f4-blue border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Upload size={20} /> Importar Base
                </button>
                <button 
                  onClick={handleOpenAddModal}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-f4-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20"
                >
                  <UserPlus size={20} /> Adicionar Banker
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredBankers.map((banker) => (
                <motion.div 
                  key={banker.id}
                  layoutId={banker.id}
                  className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all border border-transparent hover:border-f4-gold/30"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 bg-f4-blue rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {banker.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-f4-blue">{banker.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">{banker.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-f4-gold/10 text-f4-gold text-[10px] font-black uppercase tracking-widest rounded-lg border border-f4-gold/20">
                          Rating {banker.rating}
                        </span>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                          AUM: {formatCurrency(banker.aum || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 w-full md:w-auto px-8 border-x border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leads</p>
                      <p className="text-lg font-bold text-f4-blue">24</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conv.</p>
                      <p className="text-lg font-bold text-emerald-500">12%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MDC Foco</p>
                      <p className="text-lg font-bold text-f4-gold">PF</p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleOpenEditModal(banker)}
                      className="p-3 bg-slate-50 text-f4-blue rounded-xl hover:bg-f4-blue hover:text-white transition-all"
                      title="Editar Banker"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBanker(banker.id)}
                      className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                      title="Excluir Banker"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => { setSelectedBanker(banker); setActiveTab('performance'); }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 text-f4-blue rounded-xl font-bold text-sm hover:bg-f4-blue hover:text-white transition-all"
                    >
                      <BarChart3 size={18} /> Performance
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div 
            key="performance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Banker Selector Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-f4-blue mb-6 flex items-center gap-2">
                  <Users size={20} className="text-f4-gold" /> Selecionar Banker
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {bankers.map(b => (
                    <button 
                      key={b.id}
                      onClick={() => setSelectedBanker(b)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${selectedBanker?.id === b.id ? 'bg-f4-blue text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedBanker?.id === b.id ? 'bg-white/20' : 'bg-f4-blue/10 text-f4-blue'}`}>
                        {b.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate">{b.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedBanker?.id === b.id ? 'text-white/60' : 'text-slate-400'}`}>Rating {b.rating}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Detail */}
            <div className="lg:col-span-3 space-y-8">
              {selectedBanker ? (
                <>
                  <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-f4-blue rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                        {selectedBanker.name?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-f4-blue tracking-tight">{selectedBanker.name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-4 py-1.5 bg-f4-gold/10 text-f4-gold text-xs font-black uppercase tracking-widest rounded-xl border border-f4-gold/20">
                            Rating {selectedBanker.rating}
                          </span>
                          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-100">
                            AUM: {formatCurrency(selectedBanker.aum || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleOpenEditModal(selectedBanker)}
                        className="flex items-center gap-2 bg-white text-f4-blue border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Edit size={20} /> Editar Perfil
                      </button>
                      <button className="flex items-center gap-2 bg-f4-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20">
                        <MessageSquare size={20} /> Iniciar 1-on-1
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta de Ganhos (Q)</p>
                      <h4 className="text-2xl font-bold text-f4-blue">{formatCurrency(selectedBanker.monthlyGoals?.earnings || 0)}</h4>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[45%]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">45% da meta atingida</p>
                    </div>
                    <div className="glass-card p-6 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Esforço Semanal (Leads)</p>
                      <h4 className="text-2xl font-bold text-f4-blue">{Math.ceil((selectedBanker.monthlyGoals?.leads || 0) / 12)} Leads</h4>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-f4-gold h-full w-[80%]" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">80% do esforço realizado</p>
                    </div>
                    <div className="glass-card p-6 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Conversão</p>
                      <h4 className="text-2xl font-bold text-emerald-500">14.2%</h4>
                      <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold mt-4">
                        <ArrowUpRight size={12} /> 2.4% vs mês anterior
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-f4-blue mb-6 flex items-center gap-2">
                      <MessageSquare size={24} className="text-f4-gold" /> Notas de Performance & 1-on-1
                    </h3>
                    <div className="space-y-6">
                      {selectedBanker.performanceNotes?.map((note: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-f4-blue bg-white px-3 py-1 rounded-lg border border-slate-200">
                              {new Date(note.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{note.type}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            "{note.text}"
                          </p>
                        </div>
                      ))}
                      <div className="relative">
                        <textarea 
                          placeholder="Adicionar nova nota de performance..."
                          value={performanceNote}
                          onChange={(e) => setPerformanceNote(e.target.value)}
                          className="w-full p-6 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[150px] shadow-sm"
                        />
                        <button 
                          onClick={handleSaveNote}
                          disabled={isSavingNote}
                          className={`absolute bottom-4 right-4 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                            isSavingNote ? 'bg-slate-400 cursor-not-allowed' : 'bg-f4-blue text-white hover:bg-f4-accent'
                          }`}
                        >
                          {isSavingNote ? 'Salvando...' : 'Salvar Nota'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                    <UserPlus size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-f4-blue mb-2">Selecione um Banker</h3>
                  <p className="text-slate-500 max-w-sm">Escolha um banker na lista ao lado para visualizar o detalhamento de performance e gerenciar as notas de 1-on-1.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Banker Modal */}
      <AnimatePresence>
        {isAddingBanker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingBanker(false)}
              className="absolute inset-0 bg-f4-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-f4-blue text-white rounded-2xl">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-f4-blue">
                      {editingBankerId ? 'Editar Banker' : 'Cadastrar Novo Banker'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {editingBankerId ? 'Atualize os dados e configurações do parceiro.' : 'Configure os dados e o rating inicial do parceiro.'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsAddingBanker(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveBanker} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-f4-blue uppercase tracking-widest border-b border-slate-100 pb-2">Dados Básicos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                      <input 
                        required
                        type="text"
                        disabled={isSavingBanker}
                        value={bankerForm.name}
                        onChange={(e) => setBankerForm({ ...bankerForm, name: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue disabled:opacity-50"
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Corporativo</label>
                      <input 
                        required
                        type="email"
                        disabled={isSavingBanker}
                        value={bankerForm.email}
                        onChange={(e) => setBankerForm({ ...bankerForm, email: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue disabled:opacity-50"
                        placeholder="joao@f4partners.com.br"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                      <input 
                        type="text"
                        disabled={isSavingBanker}
                        value={bankerForm.phone}
                        onChange={(e) => setBankerForm({ ...bankerForm, phone: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue disabled:opacity-50"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating Atual</label>
                      <select 
                        disabled={isSavingBanker}
                        value={bankerForm.rating}
                        onChange={(e) => setBankerForm({ ...bankerForm, rating: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue disabled:opacity-50"
                      >
                        {RATINGS.map(r => <option key={r.id} value={r.id}>{r.label} ({r.commission * 100}%)</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AUM Atual (R$)</label>
                      <input 
                        type="number"
                        value={bankerForm.aum}
                        onChange={(e) => setBankerForm({ ...bankerForm, aum: Number(e.target.value) })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificações (separadas por vírgula)</label>
                      <input 
                        type="text"
                        value={bankerForm.certifications.join(', ')}
                        onChange={(e) => setBankerForm({ ...bankerForm, certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-bold text-f4-blue"
                        placeholder="CEA, ANCORD, CFP"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black text-f4-blue uppercase tracking-widest border-b border-slate-100 pb-2">Prioridades de MDC</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MDCs.map(mdc => (
                      <label key={mdc.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                        <input 
                          type="checkbox"
                          checked={bankerForm.mdcPriorities.includes(mdc.id)}
                          onChange={(e) => {
                            const priorities = e.target.checked 
                              ? [...bankerForm.mdcPriorities, mdc.id]
                              : bankerForm.mdcPriorities.filter(id => id !== mdc.id);
                            setBankerForm({ ...bankerForm, mdcPriorities: priorities });
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-f4-blue focus:ring-f4-blue"
                        />
                        <span className="text-xs font-bold text-f4-blue">{mdc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black text-f4-blue uppercase tracking-widest border-b border-slate-100 pb-2">Framework GAINS</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goals (Objetivos)</label>
                      <textarea 
                        value={bankerForm.gains.goals}
                        onChange={(e) => setBankerForm({ ...bankerForm, gains: { ...bankerForm.gains, goals: e.target.value } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                        placeholder="O que o banker deseja alcançar a curto/médio prazo?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accomplishments (Realizações)</label>
                      <textarea 
                        value={bankerForm.gains.accomplishments}
                        onChange={(e) => setBankerForm({ ...bankerForm, gains: { ...bankerForm.gains, accomplishments: e.target.value } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                        placeholder="Principais marcos e sucessos na carreira."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interests (Interesses)</label>
                      <textarea 
                        value={bankerForm.gains.interests}
                        onChange={(e) => setBankerForm({ ...bankerForm, gains: { ...bankerForm.gains, interests: e.target.value } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                        placeholder="Hobbies, paixões e o que motiva o banker fora do trabalho."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Networks (Redes de Contato)</label>
                      <textarea 
                        value={bankerForm.gains.networks}
                        onChange={(e) => setBankerForm({ ...bankerForm, gains: { ...bankerForm.gains, networks: e.target.value } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                        placeholder="Quais grupos, associações ou comunidades o banker frequenta?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skills (Habilidades)</label>
                      <textarea 
                        value={bankerForm.gains.skills}
                        onChange={(e) => setBankerForm({ ...bankerForm, gains: { ...bankerForm.gains, skills: e.target.value } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                        placeholder="Competências técnicas e comportamentais de destaque."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-f4-blue/5 rounded-3xl border border-f4-blue/10 space-y-4">
                  <h4 className="text-sm font-bold text-f4-blue flex items-center gap-2">
                    <Shield size={18} className="text-f4-gold" /> Configurações de Repasse
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    O repasse será calculado automaticamente com base no rating selecionado. Você poderá ajustar o rating do banker a qualquer momento conforme a evolução do AUM.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingBanker(false)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingBanker}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isSavingBanker ? 'bg-slate-400 cursor-not-allowed' : 'bg-f4-blue text-white hover:bg-f4-accent shadow-f4-blue/20'
                    }`}
                  >
                    <Save size={20} /> {isSavingBanker ? 'Salvando...' : (editingBankerId ? 'Salvar Alterações' : 'Confirmar Cadastro')}
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
