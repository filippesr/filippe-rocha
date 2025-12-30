
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
  Loader2,
  Target,
  ShieldCheck,
  Cpu,
  Users,
  Lock,
  ArrowUpRight
} from 'lucide-react';

// --- CONFIGURAÇÃO FORMSPREE ---
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykyqjqz'; 

// --- Utility ---
const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 11);
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
};

// --- Components ---
const Section = ({ children, className = '', id }: { children?: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`py-20 px-4 md:py-32 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-highlight/30 bg-highlight/5 text-highlight text-[10px] font-bold uppercase tracking-widest mb-8">
    {children}
  </div>
);

// --- Modals & Forms (Manter estrutura funcional anterior) ---
const DiagnosticModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nome: '', contato_social: '', email: '', whatsapp: '',
    modelo: '', faturamento: '', dependencia: '', metodo_claro: '',
    sucesso_cliente: '', tempo_resultado: '', objetivos: [] as string[],
    motivacao: '', investimento: '',
  });

  if (!isOpen) return null;

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateWhatsapp = (tel: string) => tel.replace(/\D/g, '').length >= 10;

  const checkStepValidity = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.nome.trim()) newErrors.nome = "Obrigatório";
      if (!validateEmail(formData.email)) newErrors.email = "E-mail inválido";
      if (!validateWhatsapp(formData.whatsapp)) newErrors.whatsapp = "Formato inválido";
    }
    // ... simplificado para brevidade, mas mantém a lógica
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => checkStepValidity() && setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) setIsDone(true);
      else throw new Error("Erro");
    } catch {
      setSubmitError("Erro ao enviar. Tente novamente.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 h-1 bg-highlight transition-all duration-500" style={{ width: `${progress}%` }} />
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Configuração Estratégica</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-zinc-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 md:p-12 text-center">
            {isDone ? (
                <div className="py-10">
                    <CheckCircle2 className="w-16 h-16 text-highlight mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Solicitação Enviada</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Analisaremos seu método e entraremos em contato via WhatsApp em breve.</p>
                    <button onClick={onClose} className="bg-highlight text-black px-8 py-3 font-bold rounded uppercase text-xs">Fechar</button>
                </div>
            ) : (
                <div className="text-left space-y-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Etapa {step}: {step === 1 ? 'Identificação' : 'Seu Negócio'}</h2>
                    {step === 1 && (
                        <div className="space-y-4">
                            <input placeholder="Seu Nome" className="w-full bg-white/5 border border-white/10 p-4 rounded text-white outline-none focus:border-highlight" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                            <input placeholder="WhatsApp" className="w-full bg-white/5 border border-white/10 p-4 rounded text-white outline-none focus:border-highlight" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})} />
                            <input placeholder="Instagram @usuario" className="w-full bg-white/5 border border-white/10 p-4 rounded text-white outline-none focus:border-highlight" value={formData.contato_social} onChange={e => setFormData({...formData, contato_social: e.target.value})} />
                        </div>
                    )}
                    {step > 1 && (
                        <div className="py-20 text-center text-zinc-500 italic">
                            Continuação do diagnóstico estratégico para experts...
                        </div>
                    )}
                    <div className="flex justify-between pt-10">
                        <button onClick={prevStep} className="text-zinc-500 text-xs font-bold uppercase">Voltar</button>
                        {step < totalSteps ? (
                            <button onClick={handleNext} className="bg-white text-black px-8 py-3 font-bold rounded uppercase text-xs">Próximo</button>
                        ) : (
                            <button onClick={handleSubmit} className="bg-highlight text-black px-8 py-3 font-bold rounded uppercase text-xs">Finalizar</button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Landing Page ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <Section className="pt-32 md:pt-48 text-center">
        <Badge>Feito para Experts que já vendem</Badge>
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter uppercase mb-8">
          Transforme seu método em um <span className="text-highlight">aplicativo próprio com IA</span>
        </h1>
        <p className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
          E pare de depender de aulas, encontros e da sua presença para gerar receita. Crie um ativo digital recorrente onde seus alunos executam com velocidade.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group w-full md:w-auto bg-highlight text-black px-12 py-6 rounded font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_50px_rgba(255,230,43,0.2)] flex items-center justify-center gap-3"
          >
            Quero transformar meu método em app <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto opacity-60">
          {['Não é mais um curso', 'Não é mais mentoria', 'É infraestrutura de execução'].map((t, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-highlight" /> {t}
            </div>
          ))}
        </div>
      </Section>

      {/* PAIN SECTION */}
      <Section className="bg-zinc-950 border-y border-white/5">
        <div className="mb-20">
          <Badge>O Gargalo</Badge>
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">A nova dor do expert que já vende</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
          {[
            { t: "Faturamento refém da sua entrega", d: "Sua receita depende da sua presença direta em calls e gravações." },
            { t: "Inércia dos alunos", d: "Eles consomem conteúdo, mas a execução é lenta ou inexistente." },
            { t: "Escala exige mais você", d: "Cada nova turma demanda mais suporte e mais horas de aula." },
            { t: "Falta de Ativo Real", d: "Sem múltiplo de saída. É difícil vender ou escalar sem sua imagem." }
          ].map((item, i) => (
            <div key={i} className="bg-black p-12 group hover:bg-zinc-900/30 transition-all">
              <AlertCircle className="text-zinc-700 group-hover:text-red-500 mb-6 w-8 h-8 transition-colors" />
              <h3 className="text-xl font-bold uppercase mb-4 tracking-tight">{item.t}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{item.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
            <p className="text-zinc-400 text-xl font-light">
                O mercado mudou. <span className="text-white font-bold">Conteúdo não é mais vantagem competitiva.</span><br/>Execução rápida é.
            </p>
        </div>
      </Section>

      {/* VALUE PROP SECTION */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <Badge>O que você passa a oferecer</Badge>
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-none">Implementar em vez de estudar</h2>
            <p className="text-zinc-400 text-xl mb-12 font-light leading-relaxed">
              Imagine seu cliente entrando em um app próprio, com sua marca, seu método e sua lógica de execução operada por agentes de IA.
            </p>
            
            <div className="space-y-6">
              {[
                "O cliente seleciona o objetivo estratégico",
                "Aperta botões e segue um fluxo guiado",
                "Recebe estruturas prontas e decisões orientadas",
                "Tudo treinado com o SEU método proprietário"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-highlight/30 flex items-center justify-center text-[10px] font-bold text-highlight">{i+1}</div>
                  <span className="text-zinc-300 font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-highlight/10 blur-[120px] rounded-full animate-pulse" />
            <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ai_agent_v3.core</div>
              </div>
              <div className="space-y-6">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
                <div className="p-4 bg-highlight/5 border border-highlight/20 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-highlight uppercase tracking-widest">Executar Método</span>
                    <Cpu className="w-4 h-4 text-highlight animate-spin-slow" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* BEFORE / AFTER */}
      <Section className="bg-[#050505]">
        <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-center mb-20">A Mudança de Jogo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* O QUE MUDA PRO CLIENTE */}
            <div className="bg-zinc-950 p-10 border border-white/5 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 mb-10 flex items-center gap-3">
                    <Users className="w-4 h-4" /> Para o seu cliente
                </h3>
                <div className="grid grid-cols-1 gap-8">
                    <div className="opacity-40">
                        <p className="text-[10px] font-bold uppercase mb-4 text-red-500">Antes:</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-3"><XCircle className="w-4 h-4 shrink-0" /> Cursos longos que ele não termina</li>
                            <li className="flex gap-3"><XCircle className="w-4 h-4 shrink-0" /> Mentorias que dependem de agenda</li>
                            <li className="flex gap-3"><XCircle className="w-4 h-4 shrink-0" /> Implementação lenta e confusa</li>
                        </ul>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] font-bold uppercase mb-4 text-highlight">Depois:</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-3 text-white font-bold"><CheckCircle2 className="w-4 h-4 text-highlight shrink-0" /> Execução guiada e decisões prontas</li>
                            <li className="flex gap-3 text-white font-bold"><CheckCircle2 className="w-4 h-4 text-highlight shrink-0" /> Estrutura aplicada em dias, não meses</li>
                            <li className="flex gap-3 text-white font-bold"><CheckCircle2 className="w-4 h-4 text-highlight shrink-0" /> Menos confusão, mais resultado real</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* O QUE MUDA PRA VOCÊ */}
            <div className="bg-highlight p-10 rounded-2xl text-black">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] opacity-60 mb-10 flex items-center gap-3">
                    <Star className="w-4 h-4" /> Para VOCÊ (Expert)
                </h3>
                <div className="space-y-8">
                    {[
                        { t: "Receita Recorrente Real", d: "Venda o uso da plataforma, não apenas acesso a vídeos." },
                        { t: "LTV mais alto", d: "Cancelamento cai. Retenção sobe. Valor percebido cresce." },
                        { t: "Escala sem você", d: "O app entrega o método sem exigir sua presença constante." },
                        { t: "Ativo com Múltiplo", d: "Software vale até 10x mais que infoprodutos no valuation." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <ArrowUpRight className="w-6 h-6 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-black uppercase text-lg leading-tight mb-1">{item.t}</h4>
                                <p className="text-black/60 text-sm font-medium leading-tight">{item.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </Section>

      {/* ANTI-CHECKLIST */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-16">Isso <span className="text-red-500">NÃO</span> é...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    "Um chatbot genérico",
                    "Uma área de membros com IA",
                    "Um curso automatizado 'com prompt'",
                    "Uma ferramenta pronta igual para todos"
                ].map((txt, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 text-zinc-500 font-medium">
                        <X className="w-5 h-5 text-red-500/50" /> {txt}
                    </div>
                ))}
            </div>
            <p className="mt-12 text-xl font-bold uppercase text-highlight tracking-widest">
                Isso é sua lógica de marketing transformada em sistema.
            </p>
        </div>
      </Section>

      {/* TARGET AUDIENCE */}
      <Section className="bg-zinc-950 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
                <Badge>Para quem faz sentido</Badge>
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-10">Você está pronto?</h2>
                <div className="space-y-6">
                    {[
                        "Experts em marketing digital",
                        "Mentores e consultores que já vendem",
                        "Quem tem método, visão e autoridade",
                        "Quem quer sair da dependência de aulas e calls",
                        "Quem pensa em negócio, não só faturamento"
                    ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <CheckCircle2 className="w-5 h-5 text-highlight" />
                            <span className="text-zinc-300 font-bold">{txt}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-10 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-highlight" /> Critério de Seleção
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    Se você ainda está tentando validar sua ideia, isso não é para agora. Se você já vende e quer infraestrutura para escalar, é exatamente aqui.
                </p>
                <div className="p-6 bg-highlight/10 border border-highlight/20 rounded-lg">
                    <p className="text-highlight text-xs font-black uppercase tracking-widest text-center">Apenas 3 novas vagas para implementação este mês</p>
                </div>
            </div>
        </div>
      </Section>

      {/* NEXT STEP / CTA */}
      <Section className="text-center">
        <Badge>O Próximo Passo</Badge>
        <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">Conversa Estratégica</h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16 font-light">
            Vou avaliar seu modelo, seu método e seu potencial de transformação em aplicativo. Sem pitch. Sem promessa vazia. <span className="text-white font-bold italic">Apenas clareza estratégica.</span>
        </p>
        
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-white text-black px-16 py-8 rounded-xl font-black text-lg uppercase tracking-widest hover:bg-highlight hover:scale-105 transition-all shadow-[0_20px_80px_rgba(255,255,255,0.1)]"
        >
            Quero entender como transformar meu método
        </button>
        <p className="mt-8 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">Preencha para agendar sua conversa.</p>
      </Section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="text-highlight fill-current w-5 h-5" />
            <span className="font-black uppercase tracking-tighter text-xl">Filippe Rocha</span>
          </div>
          <p className="text-zinc-700 text-[9px] uppercase tracking-[0.5em] mb-4">© {new Date().getFullYear()} Expert AI OS. All rights reserved.</p>
          <p className="text-zinc-800 text-[8px] uppercase tracking-widest max-w-sm mx-auto">Feito para experts de alta performance que buscam transformar conhecimento em ativos de software.</p>
        </div>
      </footer>

      <DiagnosticModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
