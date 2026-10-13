import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  User, 
  Users,
  DollarSign, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Save,
  Trash2,
  Target,
  Brain,
  Lightbulb,
  Award,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_LEADS } from '../mockData';
import { useNotification } from '../components/NotificationProvider';

interface CRMProps {
  profile: any;
}

const STAGES = [
  { 
    id: 'lead', 
    label: 'Lead', 
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    mentor: 'Fase de Prospecção: O objetivo aqui é o 1-a-1. Não tente vender o produto, venda a reunião.'
  },
  { 
    id: 'diagnostic', 
    label: 'Diagnóstico', 
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    mentor: 'Fase de Escuta: Use o GAINS para mapear a dor. O cérebro do cliente precisa sentir que você entende o problema dele melhor que ele mesmo.'
  },
  { 
    id: 'proposal', 
    label: 'Proposta', 
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    mentor: 'Fase de Valor: Conecte sua solução diretamente aos "Goals" (Objetivos) mapeados no GAINS.'
  },
  { 
    id: 'closing', 
    label: 'Fechamento', 
    color: 'bg-f4-blue text-white border-f4-blue/20',
    mentor: 'Fase de Decisão: Remova as fricções finais. Foque na segurança e perpetuidade do patrimônio.'
  },
  {
    id: 'cliente',
    label: 'Cliente',
    color: 'bg-emerald-500 text-white border-emerald-600/20',
    mentor: 'Fase de Pós-Venda: O lead agora é cliente. Inicie o acompanhamento MOC-F4 e garanta a entrega do valor prometido.'
  }
];

export default function CRM({ profile }: CRMProps) {
  const { notify, confirm: customConfirm } = useNotification();
  const [leads, setLeads] = useState<any[]>(MOCK_LEADS);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSavingConversion, setIsSavingConversion] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMentor, setShowMentor] = useState(true);
  const [leadActivities, setLeadActivities] = useState<any[]>([]);
  const [newActivity, setNewActivity] = useState({ type: '1-a-1', notes: '' });
  const [isLogging, setIsLogging] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [signedProposal, setSignedProposal] = useState({ signedAt: new Date().toISOString().split('T')[0], notes: '' });

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    type: 'client',
    stage: 'lead',
    mdc: '',
    mdcValue: 0,
    forecastDate: new Date().toISOString().split('T')[0],
    source: '',
    priority: 'medium',
    potentialValue: 0,
    gains: { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
  });

  const isManager = profile?.role === 'admin' || profile?.role === 'manager';
  const [bankers, setBankers] = useState<any[]>([]);
  const [selectedBankerId, setSelectedBankerId] = useState<string>('all');

  useEffect(() => {
    if (!profile?.uid) return;
    
    let q;
    if (isManager) {
      if (selectedBankerId === 'all') {
        q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'leads'), where('bankerUid', '==', selectedBankerId), orderBy('createdAt', 'desc'));
      }
    } else {
      q = query(collection(db, 'leads'), where('bankerUid', '==', profile.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setLeads([]);
      }
    }, (error) => {
      console.error("CRM Query Error:", error);
      handleFirestoreError(error, OperationType.GET, 'leads');
    });

    return () => unsubscribe();
  }, [profile?.uid, isManager, selectedBankerId]);

  useEffect(() => {
    if (!isManager) return;

    const q = query(collection(db, 'users'), where('role', '==', 'banker'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBankers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [isManager]);

  useEffect(() => {
    if (!selectedLead || profile.uid === 'dev-user') {
      setLeadActivities([]);
      return;
    }

    const q = query(
      collection(db, 'activities'), 
      where('leadId', '==', selectedLead.id),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeadActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedLead?.id, profile.uid]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newActivity.notes) return;

    setIsLogging(true);
    try {
      const activityData = {
        bankerUid: profile.uid,
        leadId: selectedLead.id,
        type: newActivity.type,
        notes: newActivity.notes,
        date: serverTimestamp()
      };

      if (profile.uid !== 'dev-user') {
        await addDoc(collection(db, 'activities'), activityData);
      } else {
        // Mock local update
        setLeadActivities(prev => [{ 
          id: Math.random().toString(36).substr(2, 9), 
          ...activityData, 
          date: { seconds: Date.now() / 1000 } 
        }, ...prev]);
      }
      setNewActivity({ type: '1-a-1', notes: '' });
    } catch (error) {
      console.error('Erro ao logar atividade:', error);
      handleFirestoreError(error, OperationType.CREATE, 'activities');
    } finally {
      setIsLogging(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Math.random().toString(36).substr(2, 9);
    setIsSavingLead(true);
    
    try {
      if (isEditing && selectedLead) {
        // Update local state first for immediate feedback
        if (profile.uid === 'dev-user') {
          setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...leadForm } : l));
        }

        if (profile.uid !== 'dev-user') {
          await updateDoc(doc(db, 'leads', selectedLead.id), {
            ...leadForm,
            lastContact: serverTimestamp()
          });
        }
      } else {
        // Add local state first
        if (profile.uid === 'dev-user') {
          const newLead = { 
            id: `temp-${tempId}`, 
            ...leadForm, 
            lastContact: { seconds: Date.now()/1000 } 
          };
          setLeads(prev => [...prev, newLead]);
        }

        if (profile.uid !== 'dev-user') {
          const docRef = await addDoc(collection(db, 'leads'), {
            ...leadForm,
            bankerUid: profile.uid,
            createdAt: serverTimestamp(),
            lastContact: serverTimestamp()
          });

          // Log initial activity
          await addDoc(collection(db, 'activities'), {
            bankerUid: profile.uid,
            leadId: docRef.id,
            type: 'Lead Criado',
            date: serverTimestamp(),
            notes: 'Lead cadastrado no sistema.'
          });
        }
      }
      
      setIsAdding(false);
      setIsEditing(false);
      setSelectedLead(null);
      resetForm();
      // Use a custom toast or simple alert for feedback
      console.log('Lead salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      if (profile.uid !== 'dev-user') {
        handleFirestoreError(error, OperationType.WRITE, 'leads');
      } else {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedLead(null);
        resetForm();
      }
    } finally {
      setIsSavingLead(false);
    }
  };

  const resetForm = () => {
    setLeadForm({
      name: '',
      type: 'client',
      stage: 'lead',
      mdc: '',
      mdcValue: 0,
      forecastDate: new Date().toISOString().split('T')[0],
      source: '',
      priority: 'medium',
      potentialValue: 0,
      gains: { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
    });
  };

  const handleUpdateStage = async (leadId: string, newStage: string) => {
    try {
      // Update local state first
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      
      if (profile.uid !== 'dev-user') {
        await updateDoc(doc(db, 'leads', leadId), { 
          stage: newStage,
          lastContact: serverTimestamp()
        });

        await addDoc(collection(db, 'activities'), {
          bankerUid: profile.uid,
          leadId,
          type: 'Mover Etapa',
          date: serverTimestamp(),
          notes: `Lead movido para ${newStage}`
        });
      }
    } catch (error) {
      console.error('Erro ao mover etapa:', error);
      if (profile.uid !== 'dev-user') {
        handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
      }
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedLead) return;
    setIsSavingConversion(true);
    try {
      const conversionData = {
        stage: 'cliente',
        lastContact: serverTimestamp(),
        convertedAt: serverTimestamp(),
        signedProposal: {
          date: signedProposal.signedAt,
          notes: signedProposal.notes
        }
      };

      if (profile.uid !== 'dev-user') {
        // 1. Update lead stage to 'cliente'
        await updateDoc(doc(db, 'leads', selectedLead.id), conversionData);

        // 2. Create activity log for signed proposal
        await addDoc(collection(db, 'activities'), {
          bankerUid: profile.uid,
          leadId: selectedLead.id,
          type: 'Fechamento',
          notes: `Proposta assinada em ${signedProposal.signedAt}. Notas: ${signedProposal.notes}`,
          date: serverTimestamp()
        });

        // 3. Create a service record for tracking
        await addDoc(collection(db, 'services'), {
          clientId: selectedLead.id,
          clientName: selectedLead.name,
          type: selectedLead.mdc || 'Consultoria',
          status: 'Ativo',
          progress: 0,
          nextStep: 'Reunião de Onboarding MOC-F4',
          bankerUid: profile.uid,
          startDate: signedProposal.signedAt,
          revenue: selectedLead.mdcValue || 0,
          createdAt: serverTimestamp()
        });
      } else {
        // Mock local update
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...conversionData } : l));
        
        // Add mock activity
        setLeadActivities(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'Fechamento',
          notes: `Proposta assinada em ${signedProposal.signedAt}. Notas: ${signedProposal.notes}`,
          date: { seconds: Date.now() / 1000 }
        }, ...prev]);
      }

      setIsConverting(false);
      setSelectedLead(null);
      notify('success', 'Lead convertido em cliente com sucesso!');
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      if (profile.uid !== 'dev-user') {
        handleFirestoreError(error, OperationType.WRITE, 'conversion');
      } else {
        setIsConverting(false);
        setSelectedLead(null);
      }
    } finally {
      setIsSavingConversion(false);
    }
  };

  const handleSeedData = () => {
    setLeads(MOCK_LEADS);
    notify('success', 'Leads de teste carregados com sucesso!');
  };

  const openEditModal = (lead: any) => {
    setSelectedLead(lead);
    setLeadForm({
      name: lead.name,
      type: lead.type,
      stage: lead.stage,
      mdc: lead.mdc || '',
      mdcValue: lead.mdcValue || 0,
      forecastDate: lead.forecastDate || new Date().toISOString().split('T')[0],
      source: lead.source || '',
      priority: lead.priority || 'medium',
      potentialValue: lead.potentialValue,
      gains: lead.gains || { goals: '', accomplishments: '', interests: '', networks: '', skills: '' }
    });
    setIsEditing(true);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-f4-blue tracking-tight">Pipeline CRM</h1>
          <p className="text-slate-500 font-medium">Gerencie seus leads e parceiros estratégicos</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMentor(!showMentor)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              showMentor ? 'bg-f4-gold text-f4-blue' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            <Brain size={18} /> Mentor {showMentor ? 'ON' : 'OFF'}
          </button>
          {isManager && (
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={selectedBankerId}
                onChange={(e) => setSelectedBankerId(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-f4-blue/10 outline-none w-64 transition-all appearance-none"
              >
                <option value="all">Todos os Bankers</option>
                {bankers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar lead..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-f4-blue/10 outline-none w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleSeedData}
            className="flex items-center gap-2 bg-white text-f4-blue border border-slate-200 px-4 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            <Zap size={18} className="text-f4-gold" /> Gerar Teste
          </button>
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center gap-2 bg-f4-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20"
          >
            <Plus size={20} /> Novo Lead
          </button>
        </div>
      </header>

      {/* Kanban Board - Responsive Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {leads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-f4-blue/5 text-f4-blue rounded-full flex items-center justify-center mb-6">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-f4-blue mb-2">Seu Pipeline está vazio</h2>
            <p className="text-slate-500 max-w-md mb-8">Comece a cadastrar seus leads ou gere dados de teste para explorar as funcionalidades do MOC-F4.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleSeedData}
                className="flex items-center gap-2 bg-f4-gold text-f4-blue px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all shadow-lg shadow-f4-gold/20"
              >
                <Zap size={20} /> Gerar Dados de Teste
              </button>
              <button 
                onClick={() => { resetForm(); setIsAdding(true); }}
                className="flex items-center gap-2 bg-f4-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20"
              >
                <Plus size={20} /> Novo Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full pb-8">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col gap-4 min-h-[500px] h-full">
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${stage.color} font-bold text-sm uppercase tracking-widest sticky top-0 z-10 glass-card shadow-sm`}>
                <span>{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{formatCurrency(leads.filter(l => l.stage === stage.id).reduce((acc, l) => acc + (l.mdcValue || 0), 0))}</span>
                  <span className="bg-white/50 px-2 py-1 rounded-lg">{leads.filter(l => l.stage === stage.id).length}</span>
                </div>
              </div>
              
              <AnimatePresence>
                {showMentor && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-indigo-900 text-white rounded-2xl text-xs font-medium leading-relaxed shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-2 text-f4-gold font-bold uppercase tracking-widest">
                      <Lightbulb size={14} /> Mentor Insight
                    </div>
                    {stage.mentor}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredLeads.filter(l => l.stage === stage.id).map((lead) => (
                    <motion.div 
                      key={lead.id}
                      layoutId={lead.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedLead(lead)}
                      className="glass-card p-5 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all border border-transparent hover:border-f4-gold/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-f4-blue leading-tight">{lead.name}</h4>
                        <button className="text-slate-400 hover:text-f4-blue"><MoreVertical size={16} /></button>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">
                        <DollarSign size={12} className="text-emerald-500" />
                        <span>{formatCurrency(lead.mdcValue || 0)}</span>
                        <span className="mx-1">•</span>
                        <Target size={12} className="text-f4-gold" />
                        <span>{lead.mdc || 'Sem MDC'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-f4-accent uppercase tracking-widest mb-4">
                        <Clock size={12} />
                        <span>Previsão: {lead.forecastDate ? new Date(lead.forecastDate).toLocaleDateString('pt-BR') : '--/--'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400"><User size={14} /></div>
                        </div>
                        <div className="flex gap-1">
                          {STAGES.map(s => (
                            <div key={s.id} className={`w-2 h-2 rounded-full ${lead.stage === s.id ? 'bg-f4-gold' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Add/Edit Lead Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-f4-blue/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8 f4-gradient text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{isEditing ? 'Refinar Lead' : 'Novo Lead MOC-F4'}</h2>
                <p className="text-f4-gold/80 text-xs font-bold uppercase tracking-widest mt-1">Mapeamento de Perfil Estratégico</p>
              </div>
              <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="hover:bg-white/10 p-3 rounded-2xl transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveLead} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações Básicas</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome Completo / Razão Social</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: João Silva ou Holding XYZ"
                          value={leadForm.name}
                          onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Estimado MDC (R$)</label>
                          <input 
                            type="number" 
                            value={leadForm.mdcValue}
                            onChange={(e) => setLeadForm({...leadForm, mdcValue: Number(e.target.value)})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previsão de Fechamento</label>
                          <input 
                            type="date" 
                            value={leadForm.forecastDate}
                            onChange={(e) => setLeadForm({...leadForm, forecastDate: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classificação</label>
                  <select 
                    value={leadForm.type}
                    onChange={(e) => setLeadForm({...leadForm, type: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all appearance-none"
                  >
                    <option value="client">Cliente Final (HNW/UHNW)</option>
                    <option value="partner">Parceiro Estratégico (COI)</option>
                    <option value="both">Perfil Híbrido</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MDC Prioritário</label>
                  <select 
                    value={leadForm.mdc}
                    onChange={(e) => setLeadForm({...leadForm, mdc: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all appearance-none"
                  >
                    <option value="">Selecione o mecanismo...</option>
                    <optgroup label="MDCs Principais">
                      <option value="Planejamento Financeiro">Planejamento Financeiro</option>
                      <option value="Consultoria de Investimentos (AUM)">Consultoria de Investimentos (AUM)</option>
                      <option value="Consórcios Inteligente">Consórcios Inteligente</option>
                      <option value="Investimentos Globais">Investimentos Globais</option>
                    </optgroup>
                    <optgroup label="MDCs de Apoio (Sob Demanda)">
                      <option value="Seguros">Seguros</option>
                      <option value="Sucessão Patrimonial">Sucessão Patrimonial</option>
                      <option value="Home Equity">Home Equity</option>
                      <option value="Plataforma de Garantia de Aluguel">Plataforma de Garantia de Aluguel</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origem (Benchmarking)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Evento XP, Indicação Dr. Marcos"
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({...leadForm, source: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prioridade de Atendimento</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setLeadForm({...leadForm, priority: p})}
                        className={`flex-1 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                          leadForm.priority === p 
                            ? (p === 'high' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 
                               p === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
                               'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20')
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Potencial de Captação (R$)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input 
                      type="number" 
                      value={leadForm.potentialValue}
                      onChange={(e) => setLeadForm({...leadForm, potentialValue: Number(e.target.value)})}
                      className="w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 font-semibold text-f4-blue transition-all"
                    />
                  </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-f4-blue flex items-center gap-3 text-lg">
                    <Target size={22} className="text-f4-gold" /> Framework GAINS
                  </h3>
                  <span className="text-[10px] font-bold text-f4-gold bg-f4-gold/10 px-3 py-1 rounded-full uppercase tracking-widest">Neuro-Mapeamento</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Goals (Objetivos de Vida)</label>
                    <textarea 
                      placeholder="O que ele realmente quer resolver? Qual o sonho por trás do dinheiro?"
                      value={leadForm.gains.goals}
                      onChange={(e) => setLeadForm({...leadForm, gains: {...leadForm.gains, goals: e.target.value}})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm min-h-[80px] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Accomplishments (Conquistas)</label>
                    <textarea 
                      placeholder="De que ele se orgulha? Qual foi sua maior decisão financeira até hoje?"
                      value={leadForm.gains.accomplishments}
                      onChange={(e) => setLeadForm({...leadForm, gains: {...leadForm.gains, accomplishments: e.target.value}})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm min-h-[80px] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Interests</label>
                      <input 
                        placeholder="Hobbies, Paixões..."
                        value={leadForm.gains.interests}
                        onChange={(e) => setLeadForm({...leadForm, gains: {...leadForm.gains, interests: e.target.value}})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Networks</label>
                      <input 
                        placeholder="Clubes, Associações..."
                        value={leadForm.gains.networks}
                        onChange={(e) => setLeadForm({...leadForm, gains: {...leadForm.gains, networks: e.target.value}})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Skills</label>
                      <input 
                        placeholder="Expertise do cliente..."
                        value={leadForm.gains.skills}
                        onChange={(e) => setLeadForm({...leadForm, gains: {...leadForm.gains, skills: e.target.value}})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSavingLead}
                className={`w-full py-6 rounded-2xl font-bold transition-all shadow-2xl flex items-center justify-center gap-3 text-lg ${
                  isSavingLead ? 'bg-slate-400 cursor-not-allowed' : 'bg-f4-blue text-white hover:bg-f4-accent shadow-f4-blue/30'
                }`}
              >
                <Save size={22} />
                {isSavingLead ? 'Salvando...' : (isEditing ? 'Atualizar Lead no Pipeline' : 'Consolidar Lead no Pipeline')}
              </button>
              </form>
            </motion.div>
          </div>
        )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-f4-blue/60 backdrop-blur-md">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-white/20"
          >
            <div className="p-10 f4-gradient text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight">{selectedLead.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-f4-gold text-xs font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">{selectedLead.type}</span>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">ID: {selectedLead.id.slice(0, 8)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="relative z-10 hover:bg-white/10 p-3 rounded-2xl transition-colors"><X size={28} /></button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-f4-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Progressão de Etapa</h3>
                  <span className="text-[10px] font-bold text-f4-blue bg-slate-100 px-3 py-1 rounded-full">Status Atual: {STAGES.find(s => s.id === selectedLead.stage)?.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {STAGES.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleUpdateStage(selectedLead.id, s.id)}
                      className={`p-5 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-between group ${
                        selectedLead.stage === s.id 
                          ? 'bg-f4-blue text-white border-f4-blue shadow-lg shadow-f4-blue/20' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-f4-blue/20 hover:bg-slate-50'
                      }`}
                    >
                      <span>{s.label}</span>
                      <ChevronRight size={16} className={selectedLead.stage === s.id ? 'text-f4-gold' : 'text-slate-300 group-hover:text-f4-blue'} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Log de Atividades (MOC-F4)</h3>
                  <Calendar size={16} className="text-f4-blue" />
                </div>
                
                <form onSubmit={handleLogActivity} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex gap-4">
                    <select 
                      value={newActivity.type}
                      onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                      className="flex-[0.4] p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-xs font-bold text-f4-blue"
                    >
                      <option value="1-a-1">1-a-1 (Conexão)</option>
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Proposta">Proposta</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Fechamento">Fechamento</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="O que aconteceu nesta interação?"
                      value={newActivity.notes}
                      onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                      className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-f4-blue/5 text-sm font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={isLogging || !newActivity.notes}
                      className={`p-4 rounded-2xl transition-all disabled:opacity-50 ${
                        isLogging ? 'bg-slate-400 cursor-not-allowed' : 'bg-f4-blue text-white hover:bg-f4-accent'
                      }`}
                    >
                      {isLogging ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {leadActivities.length > 0 ? leadActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="p-3 bg-f4-blue/5 text-f4-blue rounded-xl">
                        <Clock size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-f4-gold uppercase tracking-widest">{act.type}</span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {act.date ? new Date(act.date.seconds * 1000).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-sm text-f4-blue font-medium leading-relaxed">{act.notes}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma atividade registrada ainda.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Use o formulário acima para logar sua primeira interação MOC-F4.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Framework GAINS</h3>
                  <Target size={16} className="text-f4-gold" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(selectedLead.gains || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-f4-gold/30 transition-all group">
                      <h4 className="text-[10px] font-black text-f4-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-f4-gold" />
                        {key}
                      </h4>
                      <p className="text-f4-blue font-semibold leading-relaxed text-lg">{value || 'Informação pendente de diagnóstico...'}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-10 border-t border-slate-100 flex gap-6 bg-slate-50/50">
              {selectedLead.stage === 'closing' && (
                <button 
                  onClick={() => setIsConverting(true)}
                  className="flex-1 flex items-center justify-center gap-3 bg-emerald-500 text-white p-5 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                >
                  <Award size={22} /> Converter para Cliente
                </button>
              )}
              <button 
                onClick={async () => {
                  const confirmed = await customConfirm({
                    title: 'Remover Lead',
                    message: 'Tem certeza que deseja remover este lead do seu pipeline estratégico?',
                    confirmText: 'Remover',
                    type: 'danger'
                  });
                  
                  if (confirmed) {
                    try {
                      // Update local state first
                      setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
                      
                      if (profile.uid !== 'dev-user') {
                        await deleteDoc(doc(db, 'leads', selectedLead.id));
                      }
                      setSelectedLead(null);
                      notify('success', 'Lead removido com sucesso.');
                    } catch (error) {
                      console.error('Erro ao excluir lead:', error);
                      if (profile.uid !== 'dev-user') {
                        handleFirestoreError(error, OperationType.DELETE, `leads/${selectedLead.id}`);
                      }
                    }
                  }
                }}
                className="flex-[0.4] flex items-center justify-center gap-3 bg-red-50 text-red-600 p-5 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
              >
                <Trash2 size={22} /> Excluir
              </button>
              <button 
                onClick={() => openEditModal(selectedLead)}
                className="flex-1 flex items-center justify-center gap-3 bg-f4-blue text-white p-5 rounded-2xl font-bold hover:bg-f4-accent transition-all shadow-xl shadow-f4-blue/20"
              >
                <Save size={22} /> Editar Perfil Completo
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Convert to Client Modal */}
      <AnimatePresence>
        {isConverting && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-f4-blue/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-f4-blue">Confirmar Fechamento</h2>
                  <p className="text-slate-400 font-medium text-sm">Registre a proposta assinada para converter o lead em cliente.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Data da Assinatura</label>
                    <input 
                      type="date"
                      value={signedProposal.signedAt}
                      onChange={(e) => setSignedProposal({ ...signedProposal, signedAt: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-f4-blue focus:ring-2 focus:ring-f4-blue outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notas do Fechamento</label>
                    <textarea 
                      value={signedProposal.notes}
                      onChange={(e) => setSignedProposal({ ...signedProposal, notes: e.target.value })}
                      placeholder="Ex: Proposta assinada via DocuSign, foco em consultoria patrimonial."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-f4-blue focus:ring-2 focus:ring-f4-blue outline-none transition-all min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsConverting(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConvertToClient}
                    disabled={isSavingConversion}
                    className={`flex-1 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ${
                      isSavingConversion ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSavingConversion ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {isSavingConversion ? 'Finalizando...' : 'Finalizar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
