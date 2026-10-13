import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  User, 
  Target, 
  Award, 
  TrendingUp, 
  Save, 
  ChevronRight,
  Shield,
  Star,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  profile: any;
}

import { RATINGS } from '../constants';

const CERTIFICATIONS_LIST = ['CEA', 'ANCORD', 'CFP®', 'CFA', 'CGA', 'CNPI'];

export default function Profile({ profile }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = async () => {
    try {
      const profileRef = doc(db, 'users', profile.uid);
      // In dev mode, we just update the local state
      if (profile.uid !== 'dev-user') {
        await updateDoc(profileRef, formData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      if (profile.uid !== 'dev-user') {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      } else {
        setIsEditing(false);
      }
    }
  };

  const handleAddDocument = () => {
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Documento.pdf',
      date: new Date().toISOString().split('T')[0]
    };
    setFormData({
      ...formData,
      documents: [...(formData.documents || []), newDoc]
    });
  };

  const handleRemoveDocument = (id: string) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((d: any) => d.id !== id)
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 bg-f4-blue rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-f4-blue/20 overflow-hidden border-4 border-white">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                formData?.name?.charAt(0)
              )}
            </div>
            {isEditing && (
              <button className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Upload size={24} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-f4-blue tracking-tight">{profile?.name}</h1>
            <div className="flex items-center gap-4 text-slate-500 font-medium mt-1">
              <span className="flex items-center gap-1"><Mail size={14} /> {profile?.email}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {profile?.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-f4-gold/10 text-f4-gold text-xs font-bold uppercase tracking-widest rounded-lg border border-f4-gold/20">
                {profile?.role}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest rounded-lg border border-emerald-100">
                Rating {profile?.rating}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setFormData(profile); }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
              >
                <X size={20} /> Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <Save size={20} /> Salvar Alterações
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-f4-blue text-white shadow-lg shadow-f4-blue/20 hover:bg-f4-accent transition-all"
            >
              <User size={20} /> Editar Perfil
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Basic Information */}
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2 tracking-tight">
              <User size={24} className="text-f4-gold" /> Informações Básicas
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm"
                  />
                ) : (
                  <p className="text-f4-blue font-semibold">{profile.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Corporativo</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm"
                  />
                ) : (
                  <p className="text-f4-blue font-semibold">{profile.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm"
                  />
                ) : (
                  <p className="text-f4-blue font-semibold">{profile.phone}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating Atual</label>
                {isEditing ? (
                  <select 
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm"
                  >
                    {RATINGS.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-f4-blue font-semibold">{profile.rating}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço Profissional</label>
                {isEditing ? (
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[80px]"
                  />
                ) : (
                  <p className="text-f4-blue font-semibold text-sm leading-relaxed">{profile.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2 tracking-tight">
                <Shield size={24} className="text-f4-accent" /> Certificações
              </h3>
              {isEditing && (
                <div className="flex gap-2">
                  <select 
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    onChange={(e) => {
                      if (e.target.value && !formData.certifications?.includes(e.target.value)) {
                        setFormData({ ...formData, certifications: [...(formData.certifications || []), e.target.value] });
                      }
                    }}
                    value=""
                  >
                    <option value="">Adicionar...</option>
                    {CERTIFICATIONS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(formData.certifications || []).map((cert: string) => (
                <div key={cert} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <span className="font-bold text-f4-blue">{cert}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    {isEditing && (
                      <button 
                        onClick={() => setFormData({ ...formData, certifications: formData.certifications.filter((c: string) => c !== cert) })}
                        className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(formData.certifications || []).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 italic">Nenhuma certificação registrada.</p>
              )}
            </div>
          </div>

          {/* Documents & Contracts */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-f4-blue flex items-center gap-2 tracking-tight">
                <FileText size={24} className="text-f4-blue" /> Documentos & Contratos
              </h3>
              {isEditing && (
                <button 
                  onClick={handleAddDocument}
                  className="p-2 bg-f4-blue/5 text-f4-blue rounded-xl hover:bg-f4-blue/10 transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(formData.documents || []).map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-f4-blue">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-f4-blue">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Anexado em {doc.date}</p>
                    </div>
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {(formData.documents || []).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum documento anexado.</p>
              )}
            </div>
          </div>
        </div>

        {/* GAINS & MDC Setup */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-f4-blue tracking-tight flex items-center gap-3">
                <Target size={28} className="text-f4-gold" /> Framework GAINS do Banker
              </h3>
              {isEditing && (
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Save size={20} /> Salvar GAINS
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(formData?.gains || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {isEditing ? (
                    <textarea 
                      value={value}
                      onChange={(e) => setFormData({
                        ...formData, 
                        gains: { ...formData.gains, [key]: e.target.value }
                      })}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-f4-blue/10 font-medium text-sm min-h-[120px]"
                    />
                  ) : (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 min-h-[120px]">
                      <p className="text-f4-blue font-medium text-sm leading-relaxed">{value || 'Não definido'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-f4-blue tracking-tight">Prioridades MDC</h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className={formData.mdcPriorities?.filter((m: any) => ['Planejamento Financeiro', 'Consultoria de Investimentos (AUM)', 'Consórcios Inteligente', 'Investimentos Globais'].includes(m)).length > 2 ? 'text-rose-500' : 'text-slate-400'}>
                  Principais: {formData.mdcPriorities?.filter((m: any) => ['Planejamento Financeiro', 'Consultoria de Investimentos (AUM)', 'Consórcios Inteligente', 'Investimentos Globais'].includes(m)).length}/2
                </span>
                <span className={formData.mdcPriorities?.filter((m: any) => ['Seguros', 'Sucessão Patrimonial', 'Home Equity', 'Plataforma de Garantia de Aluguel'].includes(m)).length > 3 ? 'text-rose-500' : 'text-slate-400'}>
                  Suporte: {formData.mdcPriorities?.filter((m: any) => ['Seguros', 'Sucessão Patrimonial', 'Home Equity', 'Plataforma de Garantia de Aluguel'].includes(m)).length}/3
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-8 font-medium">
              Conforme o MOC-F4: Escolha 2 MDCs principais para foco e até 3 MDCs de suporte.
            </p>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MDCs Principais (Foco Total)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Planejamento Financeiro', 'Consultoria de Investimentos (AUM)', 'Consórcios Inteligente', 'Investimentos Globais'].map((mdc) => (
                    <button 
                      key={mdc}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => {
                        const current = formData.mdcPriorities || [];
                        const next = current.includes(mdc) 
                          ? current.filter((m: string) => m !== mdc)
                          : [...current, mdc];
                        setFormData({ ...formData, mdcPriorities: next });
                      }}
                      className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all text-left flex items-center justify-between ${
                        formData.mdcPriorities?.includes(mdc)
                          ? 'bg-f4-blue text-white border-f4-blue shadow-lg shadow-f4-blue/20'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-f4-blue/10'
                      }`}
                    >
                      <span>{mdc}</span>
                      {formData.mdcPriorities?.includes(mdc) && <CheckCircle2 size={16} className="text-f4-gold" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MDCs de Suporte (Complementares)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Seguros', 'Sucessão Patrimonial', 'Home Equity', 'Plataforma de Garantia de Aluguel'].map((mdc) => (
                    <button 
                      key={mdc}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => {
                        const current = formData.mdcPriorities || [];
                        const next = current.includes(mdc) 
                          ? current.filter((m: string) => m !== mdc)
                          : [...current, mdc];
                        setFormData({ ...formData, mdcPriorities: next });
                      }}
                      className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all text-left flex items-center justify-between ${
                        formData.mdcPriorities?.includes(mdc)
                          ? 'bg-f4-accent text-white border-f4-accent shadow-lg shadow-f4-accent/20'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-f4-blue/10'
                      }`}
                    >
                      <span>{mdc}</span>
                      {formData.mdcPriorities?.includes(mdc) && <CheckCircle2 size={16} className="text-f4-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
              Selecione os mecanismos que você irá dominar e aplicar com seus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
