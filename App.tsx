
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Layout, 
  Briefcase, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  XCircle,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

// --- CONFIGURAÇÃO FORMSPREE ---
// Endpoint oficial fornecido:
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykyqjqz'; 

// --- Utility ---

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 11);
  
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  }
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
};

// --- Components ---

const WordRotator = () => {
  const words = ["Mentoria"," Método", "Curso", "Ebook", "Planilha"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-block transition-all duration-300 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'} text-highlight`}>
      {words[index]}
    </span>
  );
};

const Section = ({ children, className = '', id }: { children?: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`py-20 px-4 md:py-40 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

// --- Diagnostic Modal ---

const DiagnosticModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nome: '',
    contato_social: '',
    email: '',
    whatsapp: '',
    modelo: '',
    faturamento: '',
    dependencia: '',
    metodo_claro: '',
    sucesso_cliente: '',
    tempo_resultado: '',
    objetivos: [] as string[],
    motivacao: '',
    investimento: '',
  });

  if (!isOpen) return null;

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateWhatsapp = (tel: string) => {
    const digits = tel.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const checkStepValidity = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.nome.trim()) newErrors.nome = "Obrigatório";
      if (!formData.contato_social.trim()) newErrors.contato_social = "Obrigatório";
      if (!validateEmail(formData.email)) newErrors.email = "E-mail inválido";
      if (!validateWhatsapp(formData.whatsapp)) newErrors.whatsapp = "Formato inválido";
    } else if (step === 2) {
      if (!formData.modelo) newErrors.modelo = "Selecione um";
      if (!formData.faturamento) newErrors.faturamento = "Selecione um";
    } else if (step === 3) {
      if (!formData.dependencia) newErrors.dependencia = "Obrigatório";
    } else if (step === 4) {
      if (!formData.metodo_claro) newErrors.metodo_claro = "Obrigatório";
      if (!formData.sucesso_cliente.trim()) newErrors.sucesso_cliente = "Obrigatório";
    } else if (step === 5) {
      if (!formData.tempo_resultado) newErrors.tempo_resultado = "Obrigatório";
    } else if (step === 6) {
      if (formData.objetivos.length === 0) newErrors.objetivos = "Selecione um";
      if (!formData.motivacao.trim()) newErrors.motivacao = "Obrigatório";
    } else if (step === 7) {
      if (!formData.investimento) newErrors.investimento = "Obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (checkStepValidity()) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkStepValidity()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          objetivos: formData.objetivos.join(', '),
          _subject: `NOVO LEAD: ${formData.nome} solicitou diagnóstico`,
          _replyto: formData.email,
          data_envio: new Date().toLocaleString('pt-BR')
        })
      });

      if (response.ok) {
        setIsDone(true);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar formulário");
      }
    } catch (error: any) {
      console.error("Erro Envio Formspree:", error);
      setSubmitError("Erro ao enviar dados. Por favor, tente novamente ou entre em contato via Instagram.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const toggleObjetivo = (obj: string) => {
    const current = [...formData.objetivos];
    const index = current.indexOf(obj);
    if (index > -1) current.splice(index, 1);
    else current.push(obj);
    handleInputChange('objetivos', current);
  };

  const inputBaseClass = (field: string) => `
    w-full h-14 bg-white/5 border rounded outline-none transition-colors 
    px-4 text-base text-white placeholder:text-zinc-600
    ${errors[field] ? 'border-red-500' : 'border-white/10 focus:border-highlight/50'}
  `;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 h-1 bg-highlight transition-all duration-500" style={{ width: `${progress}%` }} />
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Diagnóstico de Escalabilidade</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Passo {step} de {totalSteps}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {isDone ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-highlight rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(255,230,43,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Diagnóstico Solicitado</h2>
              <p className="text-zinc-400 max-w-sm mx-auto mb-10">Recebemos seus dados técnicos. Nossa equipe analisará seu método e entrará em contato via WhatsApp em até 24h.</p>
              <button onClick={onClose} className="bg-white text-black px-10 py-4 font-bold uppercase text-xs tracking-widest rounded hover:bg-highlight transition-all">Fechar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Identificação */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Identificação</h4>
                    <p className="text-zinc-500 text-sm mt-1">Dados básicos de contato para retorno.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                        Nome Completo {errors.nome && <span className="text-red-500 italic">*</span>}
                      </label>
                      <input 
                        name="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={inputBaseClass('nome')} 
                        placeholder="Ex: Filippe Rocha" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                        Instagram / Site {errors.contato_social && <span className="text-red-500 italic">*</span>}
                      </label>
                      <input 
                        name="contato_social"
                        value={formData.contato_social}
                        onChange={(e) => handleInputChange('contato_social', e.target.value)}
                        className={inputBaseClass('contato_social')} 
                        placeholder="@usuario ou seu-site.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                        E-mail {errors.email && <span className="text-red-500 italic">*</span>}
                      </label>
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        type="email" 
                        className={inputBaseClass('email')} 
                        placeholder="seu@email.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                        WhatsApp {errors.whatsapp && <span className="text-red-500 italic">*</span>}
                      </label>
                      <input 
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          const formatted = formatWhatsApp(e.target.value);
                          handleInputChange('whatsapp', formatted);
                        }}
                        type="tel" 
                        className={inputBaseClass('whatsapp')} 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Nível de Negócio</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Qual modelo você vende principalmente? {errors.modelo && <span className="text-red-500 italic ml-2">*</span>}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["Curso gravado", "Mentoria em grupo", "Mentoria 1:1", "Serviços", "Híbrido"].map(opt => (
                          <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.modelo === opt ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer hover:bg-white/10 transition-colors`}>
                            <input 
                              type="radio" 
                              name="modelo" 
                              className="accent-highlight w-4 h-4" 
                              checked={formData.modelo === opt}
                              onChange={() => handleInputChange('modelo', opt)}
                            />
                            <span className="text-sm text-zinc-300">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Faturamento mensal médio {errors.faturamento && <span className="text-red-500 italic ml-2">*</span>}</p>
                      <select 
                        name="faturamento"
                        value={formData.faturamento}
                        onChange={(e) => handleInputChange('faturamento', e.target.value)}
                        className="w-full h-14 bg-white/5 border border-white/10 px-4 rounded outline-none text-base text-zinc-300 cursor-pointer appearance-none focus:border-highlight/50"
                      >
                        <option value="" className="bg-zinc-900">Selecione...</option>
                        <option className="bg-zinc-900">Até R$ 20k</option>
                        <option className="bg-zinc-900">R$ 20k - R$ 50k</option>
                        <option className="bg-zinc-900">R$ 50k - R$ 100k</option>
                        <option className="bg-zinc-900">R$ 100k - R$ 300k</option>
                        <option className="bg-zinc-900">Acima de R$ 300k</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Dependência do Expert</h4>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Dependência da sua presença? {errors.dependencia && <span className="text-red-500 italic ml-2">*</span>}</p>
                    {["Totalmente", "Muito", "Parcialmente", "Pouco"].map(opt => (
                      <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.dependencia === opt ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer hover:bg-white/10 transition-colors`}>
                        <input type="radio" name="dependencia" checked={formData.dependencia === opt} onChange={() => handleInputChange('dependencia', opt)} className="accent-highlight w-4 h-4" />
                        <span className="text-sm text-zinc-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">O Método</h4>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Método claro e replicável? {errors.metodo_claro && <span className="text-red-500 italic ml-2">*</span>}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Sim, muito claro", "Está na minha cabeça", "Parcialmente"].map(opt => (
                      <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.metodo_claro === opt ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer hover:bg-white/10 transition-colors`}>
                        <input type="radio" name="metodo_claro" checked={formData.metodo_claro === opt} onChange={() => handleInputChange('metodo_claro', opt)} className="accent-highlight w-4 h-4" />
                        <span className="text-sm text-zinc-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">Definição de sucesso do cliente {errors.sucesso_cliente && <span className="text-red-500 italic">*</span>}</label>
                    <textarea name="sucesso_cliente" value={formData.sucesso_cliente} onChange={(e) => handleInputChange('sucesso_cliente', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded outline-none text-base text-zinc-300 min-h-[120px] focus:border-highlight/50" placeholder="Ex: Faturar 10k em 30 dias..." />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Resultados</h4>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Tempo médio para resultado? {errors.tempo_resultado && <span className="text-red-500 italic ml-2">*</span>}</p>
                  {["Menos de 7 dias", "7 a 30 dias", "1 a 3 meses", "Mais de 3 meses"].map(opt => (
                    <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.tempo_resultado === opt ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer hover:bg-white/10 transition-colors`}>
                      <input type="radio" name="tempo_resultado" checked={formData.tempo_resultado === opt} onChange={() => handleInputChange('tempo_resultado', opt)} className="accent-highlight w-4 h-4" />
                      <span className="text-sm text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Visão</h4>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">O que busca agora? {errors.objetivos && <span className="text-red-500 italic ml-2">*</span>}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Escala", "Previsibilidade", "LTV", "Ativo Real"].map(opt => (
                      <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.objetivos.includes(opt) ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer`}>
                        <input type="checkbox" name="objetivos" value={opt} checked={formData.objetivos.includes(opt)} onChange={() => toggleObjetivo(opt)} className="accent-highlight w-4 h-4" />
                        <span className="text-sm text-zinc-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">Motivação atual {errors.motivacao && <span className="text-red-500 italic">*</span>}</label>
                    <textarea name="motivacao" value={formData.motivacao} onChange={(e) => handleInputChange('motivacao', e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded outline-none text-base text-zinc-300 min-h-[100px] focus:border-highlight/50" placeholder="Ex: Quero sair do operacional..." />
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Compromisso</h4>
                  <div className="p-6 bg-highlight/5 border border-highlight/20 rounded-lg text-center">
                    <p className="text-sm text-highlight font-medium leading-relaxed">Nem todo negócio está pronto para virar sistema. Esta conversa é um diagnóstico estratégico.</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Disposto a investir? {errors.investimento && <span className="text-red-500 italic ml-2">*</span>}</p>
                  {["Sim", "Depende do escopo", "Não"].map(opt => (
                    <label key={opt} className={`flex items-center h-14 gap-3 px-4 bg-white/5 border ${formData.investimento === opt ? 'border-highlight/50 bg-highlight/5' : 'border-white/10'} rounded cursor-pointer`}>
                      <input type="radio" name="investimento" checked={formData.investimento === opt} onChange={() => handleInputChange('investimento', opt)} className="accent-highlight w-4 h-4" />
                      <span className="text-sm text-zinc-300">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3 text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="pt-8 border-t border-white/5 flex justify-between items-center bg-zinc-950 sticky bottom-0">
                <button type="button" onClick={prevStep} disabled={step === 1 || isSubmitting} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === 1 ? 'opacity-0' : 'text-zinc-500 hover:text-white disabled:opacity-30'}`}>
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                
                {step < totalSteps ? (
                  <button type="button" onClick={handleNext} className="bg-white text-black px-8 py-4 font-bold uppercase text-[10px] tracking-widest rounded flex items-center gap-2 hover:bg-highlight transition-all">
                    Próximo Passo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="bg-highlight text-black px-10 py-4 font-black uppercase text-xs tracking-widest rounded flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,230,43,0.2)] disabled:opacity-50 disabled:scale-100">
                    {isSubmitting ? (
                      <>Enviando... <Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : (
                      <>Solicitar Diagnóstico <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Landing Page Sections ---

const Hero = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <Section className="pt-24 md:pt-48 text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-highlight/30 text-highlight text-[9px] font-bold uppercase tracking-[0.3em] mb-10">
      Feito para Infoprodutores
    </div>
    <h1 className="text-[22px] xs:text-2xl sm:text-4xl md:text-7xl font-black leading-[1.2] md:leading-[1.05] mb-10 tracking-tighter max-w-6xl mx-auto uppercase">
      <span className="block md:inline whitespace-nowrap">Transforme <WordRotator /></span>
      <span className="block md:inline"> em um aplicativo próprio com IA</span>
    </h1>
    <p className="text-base md:text-2xl text-zinc-400 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
      Pare de depender de aulas, encontros e da sua presença para gerar receita. Crie um ativo escalável com inteligência proprietária.
    </p>
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
      <button 
        onClick={onOpenModal}
        className="w-full sm:w-auto bg-white hover:bg-highlight text-black px-12 py-5 rounded font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105"
      >
        Solicitar Acesso <ArrowRight className="w-4 h-4 inline ml-2" />
      </button>
    </div>
    <div className="border-t border-white/5 pt-16 max-w-4xl mx-auto">
      <p className="text-zinc-500 text-base md:text-xl leading-relaxed max-w-3xl mx-auto">
        "Crie um ativo digital recorrente, onde seus alunos executam com velocidade usando agentes de IA alinhados ao seu método."
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6">
        {['Não é curso', 'Não é mentoria', 'É infraestrutura'].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-white font-bold text-[9px] uppercase tracking-widest opacity-40">
            <span className="w-1 h-1 bg-highlight rounded-full" /> {item}
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const Problem = () => (
  <Section className="bg-[#050505] border-y border-white/5">
    <div className="text-left mb-24 max-w-3xl">
      <h2 className="text-3xl md:text-6xl font-black mb-8 tracking-tighter uppercase">A nova dor do Infoprodutor que já vende</h2>
      <p className="text-zinc-500 text-xl font-light">Se você já escala no digital, o seu maior gargalo hoje é a sua própria humanidade.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/5 border border-white/5">
      {[
        { title: "Cansaço da Entrega", desc: "Seu faturamento é refém da sua presença em calls e gravações." },
        { title: "Inércia do Aluno", desc: "Alunos consomem, mas a execução é lenta ou inexistente." },
        { title: "Suporte Infinito", desc: "Escalar exige mais time, mais custo e mais gestão de pessoas." },
        { title: "Sem Valuation", desc: "Negócios de 'Eu-expert' são difíceis de vender ou herdar." },
        { title: "Transformação Lenta", desc: "O cliente demora meses para ver o primeiro resultado real." },
        { title: "Commoditização", desc: "Conteúdo já não é mais diferencial. Infraestrutura de execução é." }
      ].map((item, idx) => (
        <div key={idx} className="bg-black p-10 group hover:bg-zinc-900/30 transition-colors">
          <div className="text-highlight text-xs font-mono mb-6">0{idx + 1} //</div>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

const Vision = () => (
  <Section>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div>
        <h2 className="text-3xl md:text-6xl font-black mb-10 tracking-tighter uppercase">O que te entregamos</h2>
        <p className="text-zinc-400 text-xl mb-12 leading-relaxed font-light">
          Um ecossistema proprietário onde o cliente não "estuda", ele <strong>opera</strong> seu método através de IA.
        </p>
        <div className="space-y-8">
          {[
            "Seleciona o objetivo estratégico",
            "Aperta botões de pré-configuração",
            "Segue um fluxo de decisão guiado",
            "Recebe ativos prontos para o mercado"
          ].map((text, idx) => (
            <div key={idx} className="flex items-center gap-6 group">
              <div className="w-10 h-10 border border-white/10 group-hover:border-highlight group-hover:text-highlight transition-all flex items-center justify-center font-mono text-sm">
                0{idx + 1}
              </div>
              <span className="text-lg text-zinc-300 group-hover:text-white transition-colors">{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-20 bg-highlight/5 blur-[120px] rounded-full"></div>
        <div className="relative bg-black border border-white/10 rounded overflow-hidden shadow-[0_0_100px_rgba(255,230,43,0.05)]">
          <div className="p-3 bg-zinc-900/50 flex items-center gap-2 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-highlight"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <span className="ml-4 text-[9px] text-zinc-500 font-mono tracking-widest uppercase">system.os // engine_core</span>
          </div>
          <div className="p-10 space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <div className="space-y-1">
                <div className="h-3 w-24 bg-zinc-800 rounded-sm"></div>
                <div className="h-2 w-16 bg-zinc-900 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-highlight rounded-sm flex items-center justify-center transition-transform hover:rotate-12">
                <Zap className="text-black w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-zinc-900 rounded-sm border border-highlight/20 flex items-center px-4 gap-3">
                <div className="w-2 h-2 bg-highlight animate-pulse"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-highlight">AI_CORE: ACTIVE</span>
              </div>
              <div className="p-6 border border-white/5 bg-zinc-950 rounded-sm space-y-3">
                <div className="h-2 w-full bg-zinc-800 rounded-full"></div>
                <div className="h-2 w-5/6 bg-zinc-800 rounded-full"></div>
                <div className="h-2 w-4/6 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const Comparison = () => (
  <Section className="bg-[#050505]">
    <h2 className="text-3xl md:text-6xl font-black mb-20 tracking-tighter uppercase text-center">A mudança de paradigma</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <h3 className="text-zinc-600 font-bold uppercase tracking-widest text-sm mb-10 flex items-center gap-4 text-center justify-center">
          <XCircle className="w-5 h-5" /> Modelo Obsoleto
        </h3>
        {[
          "Cursos longos que ninguém termina",
          "Mentorias dependentes de agenda",
          "Execução manual e lenta",
          "Baixa retenção pós-venda",
          "Escala vertical (mais custos)"
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 text-zinc-600 line-through decoration-zinc-800">
            <span className="text-xs font-mono shrink-0">0{idx + 1}</span>
            <span className="text-lg">{item}</span>
          </div>
        ))}
      </div>
      <div className="space-y-8 p-10 border border-white/10 bg-zinc-950/30 rounded-lg">
        <h3 className="text-highlight font-bold uppercase tracking-widest text-sm mb-10 flex items-center gap-4 text-center justify-center">
          <Zap className="w-5 h-5 text-highlight fill-current" /> Modelo Novo
        </h3>
        {[
          "Execução guiada por Agentes de IA",
          "Entrega 24/7 sem você",
          "Resultados em dias, não meses",
          "LTV exponencial (uso contínuo)",
          "Escala horizontal (software)"
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 text-white">
            <CheckCircle2 className="w-5 h-5 text-highlight shrink-0" />
            <span className="text-lg font-bold tracking-tight">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const ValuationSection = () => (
  <Section>
    <div className="text-center mb-24">
      <h2 className="text-3xl md:text-7xl font-black mb-8 tracking-tighter uppercase">De Infoproduto a Ativo Digital</h2>
      <p className="text-zinc-500 text-xl font-light">Isso muda completamente o seu jogo de lucro e tempo gasto.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
      {[
        { title: "Recorrência", desc: "Venda o uso da plataforma, não apenas o acesso ao conteúdo.", icon: <TrendingUp /> },
        { title: "Retenção", desc: "Quanto mais usam seu software, mais difícil é cancelar.", icon: <Star /> },
        { title: "Independência", desc: "O método funciona sem sua presença constante.", icon: <Briefcase /> },
        { title: "Múltiplo", desc: "Empresas de software (SaaS) valem até 10x mais que infoprodutos.", icon: <Layout /> }
      ].map((item, idx) => (
        <div key={idx} className="bg-black p-10 border-white/5 hover:bg-zinc-900/30 transition-all group">
          <div className="text-white group-hover:text-highlight transition-colors mb-6">
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
          </div>
          <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

const FinalCTA = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <Section className="bg-white/5">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-6xl font-black mb-8 tracking-tighter uppercase">Pronto para a transição?</h2>
      <p className="text-zinc-500 text-xl mb-12 font-light">
        A infraestrutura de execução que o seu método merece. Pare de vender tempo e comece a vender ativos operacionais.
      </p>
      <button 
        onClick={onOpenModal}
        className="w-full md:w-auto bg-highlight text-black px-16 py-6 font-black uppercase text-sm tracking-[0.2em] transition-all hover:scale-105 shadow-[0_20px_60px_rgba(255,230,43,0.1)] rounded"
      >
        Solicitar Diagnóstico Estratégico
      </button>
      <p className="text-[10px] text-zinc-500 mt-8 uppercase tracking-widest">Apenas para experts com faturamento validado.</p>
    </div>
  </Section>
);

const Footer = () => (
  <footer className="py-24 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-10 transition-all cursor-default">
        <div className="w-6 h-6 bg-highlight rounded flex items-center justify-center">
          <Zap className="text-black w-4 h-4 fill-current" />
        </div>
        <span className="text-sm font-bold tracking-tighter uppercase">Filippe Rocha</span>
      </div>
      <div className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] space-x-8 mb-8 flex flex-wrap justify-center gap-y-4">
        <a href="#" className="hover:text-highlight transition-colors">Termos</a>
        <a href="#" className="hover:text-highlight transition-colors">Privacidade</a>
        <a href="#" className="hover:text-highlight transition-colors">Framework</a>
      </div>
      <p className="text-zinc-700 text-[9px] uppercase tracking-widest text-center">© {new Date().getFullYear()} Filippe Rocha. Built for high performance experts.</p>
    </div>
  </footer>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen selection:bg-highlight selection:text-black">
      <main>
        <Hero onOpenModal={() => setIsModalOpen(true)} />
        <Problem />
        <Vision />
        <Comparison />
        <ValuationSection />
        <FinalCTA onOpenModal={() => setIsModalOpen(true)} />
      </main>
      <Footer />
      
      <DiagnosticModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
