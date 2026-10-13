import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  FileText, 
  User, 
  CreditCard, 
  Briefcase, 
  CheckCircle2, 
  Printer, 
  ChevronRight,
  Mail,
  Phone,
  Hash,
  Calendar,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Plus,
  Trash2,
  X,
  Download,
  ArrowLeft,
  Loader2,
  ShieldCheck as ShieldCheckIcon,
  Search
} from 'lucide-react';
import { INITIAL_DATA, ProposalData } from '../types';
import { cn } from '../lib/utils';

interface ProposalGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'planning' | 'consulting' | 'both';
  profile: any;
}

// A4 dimensions in mm: 210 x 297
// We use a fixed width for the HTML to ensure consistent rendering
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

const ProposalPage = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={cn(
      "proposal-page bg-white relative overflow-hidden mx-auto print:shadow-none print:border-none",
      "w-[210mm] h-[297mm] p-[20mm] box-border",
      className
    )}
    style={{ 
      width: '210mm', 
      height: '297mm',
      pageBreakAfter: 'always',
      backgroundColor: 'white'
    }}
  >
    {children}
  </div>
);

export default function ProposalGenerator({ isOpen, onClose, initialType = 'planning', profile }: ProposalGeneratorProps) {
  const [data, setData] = useState<ProposalData>({ 
    ...INITIAL_DATA, 
    serviceType: initialType,
    consultantName: profile.name || 'Consultor F4',
    consultantEmail: profile.email || 'contato@f4partners.com.br',
    consultantPhone: profile.phone || '(11) 99999-9999'
  });
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && profile.uid !== 'dev-user') {
      fetchLeads();
    }
  }, [isOpen]);

  const fetchLeads = async () => {
    try {
      const q = query(collection(db, 'leads'), where('bankerUid', '==', profile.uid));
      const querySnapshot = await getDocs(q);
      const leadsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadsList);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    }
  };

  const selectLead = (lead: any) => {
    setData({
      ...data,
      clientName: lead.name,
      clientEmail: lead.email || '',
      clientPhone: lead.phone || '',
      clientCpf: lead.cpf || '',
      planningValue: lead.mdcValue?.toString() || data.planningValue
    });
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Find all pages
      const pages = containerRef.current.querySelectorAll('.proposal-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Ensure fonts and images are loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture each page individually as PNG
        const imgData = await toPng(page, {
          quality: 1.0,
          pixelRatio: 3, // Higher quality
          backgroundColor: '#ffffff',
          skipFonts: false,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            width: '210mm',
            height: '297mm',
          }
        });
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, undefined, 'SLOW');
      }

      pdf.save(`Proposta_F4_${data.clientName.replace(/\s+/g, '_') || 'Cliente'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente ou use a função de imprimir do navegador.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Header - Hidden on Print */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-f4-blue flex items-center justify-center rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-f4-blue uppercase">Gerador de Propostas F4</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Método MOC-F4</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setStep(step === 'edit' ? 'preview' : 'edit')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            {step === 'edit' ? 'Visualizar Proposta' : 'Voltar para Edição'}
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-f4-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-f4-accent transition-all shadow-lg shadow-f4-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGenerating ? 'Gerando...' : 'Baixar PDF'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-600"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </header>

      <main className={cn(
        "max-w-[1400px] mx-auto p-6 lg:p-10 print:p-0",
        step === 'edit' ? "grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8" : "block"
      )}>
        
        {/* Editor Sidebar - Hidden on Print and Preview Step */}
        <aside className={cn("space-y-8 print:hidden", step === 'preview' && "hidden")}>
          <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-400">
              <LayoutDashboard className="w-4 h-4" />
              Tipo de Serviço
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {(['planning', 'consulting', 'both'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setData({ ...data, serviceType: type })}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border",
                    data.serviceType === type 
                      ? "bg-f4-blue text-white border-f4-blue shadow-lg shadow-f4-blue/20" 
                      : "bg-white text-slate-500 border-slate-100 hover:border-f4-blue/20"
                  )}
                >
                  {type === 'planning' ? 'Planejamento' : type === 'consulting' ? 'Consultoria' : 'Ambos'}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                <User className="w-4 h-4" />
                Dados do Cliente
              </h2>
              <div className="relative">
                <button 
                  onClick={() => setIsSearching(!isSearching)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-f4-blue"
                >
                  <Search size={16} />
                </button>
                
                <AnimatePresence>
                  {isSearching && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50"
                    >
                      <input 
                        type="text"
                        placeholder="Buscar lead..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-f4-blue"
                      />
                      <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
                        {leads.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(lead => (
                          <button
                            key={lead.id}
                            onClick={() => selectLead(lead)}
                            className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-f4-blue transition-colors"
                          >
                            {lead.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="space-y-4">
              <InputField 
                label="Nome do Cliente" 
                value={data.clientName} 
                onChange={(v) => setData({ ...data, clientName: v })} 
                placeholder="Ex: João Silva"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="CPF" 
                  value={data.clientCpf} 
                  onChange={(v) => setData({ ...data, clientCpf: v })} 
                  placeholder="000.000.000-00"
                />
                <InputField 
                  label="Telefone" 
                  value={data.clientPhone} 
                  onChange={(v) => setData({ ...data, clientPhone: v })} 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <InputField 
                label="E-mail" 
                value={data.clientEmail} 
                onChange={(v) => setData({ ...data, clientEmail: v })} 
                placeholder="cliente@email.com"
              />
            </div>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
              <CreditCard className="w-4 h-4" />
              Valores e Pagamento
            </h2>
            
            {data.serviceType !== 'consulting' && (
              <div className="space-y-4 pt-2 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-f4-gold">Planejamento Financeiro</p>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField 
                    label="Faixa" 
                    value={data.planningTier} 
                    options={['Essencial', 'Estratégico', 'Empresarial', 'Patrimonial']}
                    onChange={(v) => setData({ ...data, planningTier: v as any })} 
                  />
                  <InputField 
                    label="Valor (R$)" 
                    value={data.planningValue} 
                    onChange={(v) => setData({ ...data, planningValue: v })} 
                  />
                </div>
                <InputField 
                  label="Forma de Pagamento" 
                  value={data.planningPaymentMethod} 
                  onChange={(v) => setData({ ...data, planningPaymentMethod: v })} 
                />
              </div>
            )}

            {data.serviceType !== 'planning' && (
              <div className="space-y-4 pt-2 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-f4-accent">Consultoria de Investimentos</p>
                <InputField 
                  label="Faixa Patrimonial" 
                  value={data.consultingAumTier} 
                  onChange={(v) => setData({ ...data, consultingAumTier: v })} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Fee Anual (%)" 
                    value={data.consultingFee} 
                    onChange={(v) => setData({ ...data, consultingFee: v })} 
                  />
                  <InputField 
                    label="Mínimo Mensal" 
                    value={data.consultingMinMonthly} 
                    onChange={(v) => setData({ ...data, consultingMinMonthly: v })} 
                  />
                </div>
              </div>
            )}
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                <Briefcase className="w-4 h-4" />
                Escopo do Projeto
              </h2>
              <button 
                onClick={() => setData({ ...data, customScope: [...data.customScope, 'Novo item de escopo'] })}
                className="p-1 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {data.customScope.map((item, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <input 
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-f4-blue outline-none"
                    value={item}
                    onChange={(e) => {
                      const newScope = [...data.customScope];
                      newScope[idx] = e.target.value;
                      setData({ ...data, customScope: newScope });
                    }}
                  />
                  <button 
                    onClick={() => {
                      const newScope = data.customScope.filter((_, i) => i !== idx);
                      setData({ ...data, customScope: newScope });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Proposal Preview */}
        <div 
          ref={containerRef}
          className={cn(
            "space-y-8",
            step === 'edit' ? "scale-[0.6] origin-top lg:scale-100" : "max-w-[210mm] mx-auto"
          )}
        >
          {/* Page 1: Cover */}
          <ProposalPage className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-4xl font-black tracking-tighter flex items-baseline gap-1 text-f4-blue italic">
                  F4<span className="text-f4-gold not-italic font-light">PARTNERS</span>
                </div>
                <div className="h-1 w-12 bg-f4-gold"></div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proposta Comercial</p>
                <p className="text-xs font-mono text-f4-blue font-bold">{data.proposalDate}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase text-f4-blue break-words">
                  {data.serviceType === 'planning' ? 'Planejamento Financeiro' : 
                   data.serviceType === 'consulting' ? 'Consultoria de Investimentos' : 
                   'Gestão Patrimonial 360°'}
                </h1>
                <p className="text-xl text-f4-gold font-bold max-w-xl italic break-words whitespace-pre-wrap">
                  {data.serviceType === 'planning' 
                    ? "Clareza, governança e decisões patrimoniais estruturadas."
                    : "Governança contínua, independência e alinhamento total com o cliente."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-20">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preparado para</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-f4-blue break-words">{data.clientName || 'Nome do Cliente'}</p>
                  <p className="text-sm text-slate-500 font-medium break-all">{data.clientEmail}</p>
                  <p className="text-sm text-slate-500 font-medium">{data.clientCpf}</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultoria</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-f4-blue">{data.consultantName}</p>
                  <p className="text-sm text-slate-500 font-medium">{data.consultantEmail}</p>
                  <p className="text-sm text-slate-500 font-medium">{data.consultantPhone}</p>
                  <p className="text-sm text-slate-500 font-medium">www.f4partners.com.br</p>
                </div>
              </div>
            </div>
          </ProposalPage>

          {/* Page 2: Introduction */}
          <ProposalPage className="space-y-12">
            <div className="max-w-2xl space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-f4-blue break-words">Prezado(a) {data.clientName.split(' ')[0] || 'Sr(a)'},</h2>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600 break-words whitespace-pre-wrap">
                <p>
                  Agradecemos a oportunidade de iniciar este processo. A decisão de aprofundar o entendimento sobre suas finanças é um marco fundamental, pois é a partir dessa clareza que se constroem decisões mais seguras, coerentes e sustentáveis ao longo da vida.
                </p>
                <p>
                  Esta proposta foi elaborada para clientes que desejam organizar, compreender e governar o próprio patrimônio com método. {data.serviceType !== 'consulting' && 'O Planejamento Financeiro F4 representa a etapa obrigatória de onboarding, na qual estruturamos o mapa patrimonial.'}
                </p>
                <p>
                  Nosso papel é garantir que o planejamento construído se transforme em execução disciplinada, com critérios claros e ajustes consistentes ao longo do tempo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[32px] space-y-4 border border-slate-100">
                <ShieldCheckIcon className="w-8 h-8 text-f4-gold" />
                <h3 className="font-bold text-xl text-f4-blue">Alinhamento Total</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  A F4 não atua por comissões nem por recomendações pontuais, mas como parceira estratégica na gestão e evolução do seu patrimônio.
                </p>
              </div>
              <div className="bg-f4-blue text-white p-8 rounded-[32px] space-y-4 shadow-xl shadow-f4-blue/20">
                <TrendingUp className="w-8 h-8 text-f4-gold" />
                <h3 className="font-bold text-xl">Visão de Longo Prazo</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Focamos em um sistema de governança patrimonial contínua, voltado à organização, acompanhamento e evolução do seu patrimônio.
                </p>
              </div>
            </div>
          </ProposalPage>

          {/* Page 3: Methodology / Scope */}
          <ProposalPage className="space-y-12">
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-f4-blue">Escopo e Entregas</h2>
              <p className="text-xs font-mono text-f4-gold font-bold">MÉTODO MOC-F4</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">O que está incluso</h3>
                <div className="space-y-4">
                  {data.customScope.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-f4-gold shrink-0" />
                      <p className="text-lg font-bold tracking-tight text-f4-blue leading-tight break-words">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Fora do Escopo</h3>
                <div className="space-y-4">
                  {[
                    'Execução/custódia de investimentos',
                    'Ordens ou movimentações em instituições',
                    'Promessa de rentabilidade garantida',
                    'Gestão direta de ativos (discricionária)'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 opacity-40">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <p className="text-sm font-medium tracking-tight text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[40px] space-y-8 border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-f4-blue">Etapas do Processo</h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Diagnóstico', desc: 'Coleta e consolidação de informações.' },
                  { step: '02', title: 'Clareza Estratégica', desc: 'Objetivos e prioridades → matemática executável.' },
                  { step: '03', title: 'Plano & Critérios', desc: 'Critérios de decisão e recomendações orientativas.' },
                  { step: '04', title: 'Governança', desc: 'Agenda de revisões e registro (rastreabilidade).' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-6">
                    <span className="text-xs font-mono font-black text-f4-gold">{s.step}</span>
                    <div className="space-y-1">
                      <p className="font-bold text-f4-blue">{s.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ProposalPage>

          {/* Page 4: Conditions & Signatures */}
          <ProposalPage className="space-y-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-f4-blue">Condições Comerciais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.serviceType !== 'consulting' && (
                <div className="border-2 border-slate-100 p-10 rounded-[40px] space-y-8 bg-white">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-f4-gold">Planejamento Financeiro</p>
                    <h3 className="text-2xl font-bold tracking-tight text-f4-blue">Plano {data.planningTier}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black tracking-tighter text-f4-blue break-words">R$ {data.planningValue}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Investimento único / Projeto</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-500 font-medium shrink-0">Forma de Pagamento</span>
                      <span className="font-bold text-f4-blue text-right break-words">{data.planningPaymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-500 font-medium shrink-0">Prazo de Entrega</span>
                      <span className="font-bold text-f4-blue text-right break-words">{data.planningDeliveryTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {data.serviceType !== 'planning' && (
                <div className="bg-f4-blue text-white p-10 rounded-[40px] space-y-8 shadow-2xl shadow-f4-blue/20">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-f4-gold">Consultoria de Investimentos</p>
                    <h3 className="text-2xl font-bold tracking-tight">{data.consultingAumTier}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black tracking-tighter text-f4-gold break-words">{data.consultingFee}</p>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Fee Anual sobre AUM</p>
                  </div>
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-white/50 font-medium shrink-0">Mínimo Mensal</span>
                      <span className="font-bold text-f4-gold text-right break-words">{data.consultingMinMonthly}</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-white/50 font-medium shrink-0">Modelo</span>
                      <span className="font-bold text-right">Fee-Based / Independente</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-slate-50 p-8 rounded-[32px] space-y-4 border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-f4-blue">Avisos Importantes (Disclaimer)</h4>
              <p className="text-[10px] leading-relaxed text-slate-500 font-medium uppercase tracking-tight break-words whitespace-pre-wrap">
                Este documento tem finalidade informativa e comercial. O detalhamento jurídico e condições completas constam no contrato. A F4 Partners não promete rentabilidade, não garante resultados e não faz ‘promessa de lucro’. Investimentos envolvem riscos. O Planejamento Financeiro é serviço orientativo/educacional: não implica execução, custódia, nem intermediação de valores mobiliários.
              </p>
            </div>

            {/* Signature Area */}
            <div className="pt-20 grid grid-cols-2 gap-20">
              <div className="space-y-8">
                <div className="h-px bg-slate-200 w-full" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-f4-blue">{data.consultantName}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Consultoria Responsável</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="h-px bg-slate-200 w-full" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-f4-blue">{data.clientName || 'Assinatura do Cliente'}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aceite da Proposta</p>
                </div>
              </div>
            </div>
          </ProposalPage>
        </div>
      </main>

      {/* Footer - Hidden on Print */}
      <footer className="mt-20 py-10 border-t border-slate-100 text-center print:hidden">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">F4 Partners © 2026 | Gestão Patrimonial Inteligente</p>
      </footer>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input 
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-f4-blue focus:ring-2 focus:ring-f4-blue outline-none transition-all placeholder:text-slate-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <select 
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-f4-blue focus:ring-2 focus:ring-f4-blue outline-none appearance-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
