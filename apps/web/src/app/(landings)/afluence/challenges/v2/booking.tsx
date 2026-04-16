'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  DollarSign,
  User,
  Briefcase,
  MessageCircle,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Lock,
  Globe,
  CalendarCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════ */

type CalendarState = 'locked' | 'unlocked' | 'rejected' | 'rejected-whatsapp';

type FormData = {
  nombre: string;
  email: string;
  countryCode: string;
  whatsapp: string;
  linkSocial: string;
  nicho: string;
  vendeProductos: string;
  tieneHighTicket: string;
  audienciaSize: string;
  temaReto: string;
  duracionReto: string;
  tieneContenido: string;
  inversion: string;
  timing: string;
  confirmaWhatsapp: string;
};

const initialData: FormData = {
  nombre: '',
  email: '',
  countryCode: '+52',
  whatsapp: '',
  linkSocial: '',
  nicho: '',
  vendeProductos: '',
  tieneHighTicket: '',
  audienciaSize: '',
  temaReto: '',
  duracionReto: '',
  tieneContenido: '',
  inversion: '',
  timing: '',
  confirmaWhatsapp: '',
};

const countryCodes = [
  { code: '+52', country: 'MX', flag: '\u{1F1F2}\u{1F1FD}', name: 'México' },
  { code: '+57', country: 'CO', flag: '\u{1F1E8}\u{1F1F4}', name: 'Colombia' },
  { code: '+54', country: 'AR', flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
  { code: '+56', country: 'CL', flag: '\u{1F1E8}\u{1F1F1}', name: 'Chile' },
  { code: '+51', country: 'PE', flag: '\u{1F1F5}\u{1F1EA}', name: 'Perú' },
  { code: '+593', country: 'EC', flag: '\u{1F1EA}\u{1F1E8}', name: 'Ecuador' },
  { code: '+58', country: 'VE', flag: '\u{1F1FB}\u{1F1EA}', name: 'Venezuela' },
  { code: '+591', country: 'BO', flag: '\u{1F1E7}\u{1F1F4}', name: 'Bolivia' },
  { code: '+595', country: 'PY', flag: '\u{1F1F5}\u{1F1FE}', name: 'Paraguay' },
  { code: '+598', country: 'UY', flag: '\u{1F1FA}\u{1F1FE}', name: 'Uruguay' },
  { code: '+507', country: 'PA', flag: '\u{1F1F5}\u{1F1E6}', name: 'Panamá' },
  { code: '+506', country: 'CR', flag: '\u{1F1E8}\u{1F1F7}', name: 'Costa Rica' },
  { code: '+502', country: 'GT', flag: '\u{1F1EC}\u{1F1F9}', name: 'Guatemala' },
  { code: '+503', country: 'SV', flag: '\u{1F1F8}\u{1F1FB}', name: 'El Salvador' },
  { code: '+504', country: 'HN', flag: '\u{1F1ED}\u{1F1F3}', name: 'Honduras' },
  { code: '+505', country: 'NI', flag: '\u{1F1F3}\u{1F1EE}', name: 'Nicaragua' },
  { code: '+1', country: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: 'Estados Unidos' },
  { code: '+34', country: 'ES', flag: '\u{1F1EA}\u{1F1F8}', name: 'España' },
  { code: '+55', country: 'BR', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brasil' },
  { code: '+44', country: 'GB', flag: '\u{1F1EC}\u{1F1E7}', name: 'Reino Unido' },
];

const nichos = ['Fitness', 'Nutrición', 'Coaching', 'Educación', 'Finanzas', 'Mindfulness', 'Belleza', 'Negocios', 'Idiomas', 'Otro'];
const audienceSizes = ['1K–10K seguidores', '10K–50K seguidores', '50K–200K seguidores', '200K+ seguidores'];
const duraciones = ['7 días (intenso, resultados rápidos)', '14 días (balance perfecto)', '21 días (transformación profunda)', 'No estoy seguro'];
const contenidoOptions = ['Ya tengo un curso o programa existente', 'Tengo contenido suelto que puedo estructurar', 'Tengo el conocimiento pero no contenido escrito', 'Necesito ayuda para crear todo'];
const inversiones = [
  { label: 'Sí, estoy listo para invertir desde 7K', value: 'ready' },
  { label: 'Estoy evaluando ese rango', value: 'evaluating' },
  { label: 'Busco algo menor', value: 'lower' },
];
const timings = ['Inmediatamente', '1–3 meses', '3–6 meses', 'Explorando'];
const whatsappOptions = [
  { label: 'Perfecto, espero el mensaje', value: 'yes' },
  { label: 'No voy a confirmar la reunión', value: 'no' },
];

const stepsMeta = [
  { icon: User, label: 'Perfil', time: '~30s' },
  { icon: Briefcase, label: 'Negocio', time: '~20s' },
  { icon: Target, label: 'Tu Reto', time: '~15s' },
  { icon: DollarSign, label: 'Inversión', time: '~10s' },
  { icon: MessageCircle, label: 'Confirmar', time: '~10s' },
];

const TOTAL_STEPS = 5;

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.8125rem] text-brand-text-secondary" style={{ fontWeight: 500 }}>
        {label}
        {required && <span className="text-[#25D366] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioButton({ label, selected, onClick, variant, icon }: { label: string; selected: boolean; onClick: () => void; variant?: 'warning'; icon?: React.ReactNode }) {
  const isWarning = variant === 'warning' && selected;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-[0.8125rem] transition-all cursor-pointer text-left ${
        isWarning
          ? 'border-amber-500/30 bg-amber-500/8 text-amber-400'
          : selected
          ? 'border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.1)]'
          : 'border-brand-border bg-brand-surface-elevated/50 text-brand-text-secondary hover:border-brand-border-hover hover:bg-brand-surface-elevated'
      }`}
    >
      <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${isWarning ? 'border-amber-500' : selected ? 'border-[#25D366]' : 'border-brand-muted/30'}`}>
        {selected && <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-[#25D366]'}`} />}
      </div>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

function WhatsAppInput({ countryCode, phone, onCountryCodeChange, onPhoneChange }: { countryCode: string; phone: string; onCountryCodeChange: (code: string) => void; onPhoneChange: (phone: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = countryCodes.find((c) => c.code === countryCode) || countryCodes[0];
  const filtered = search
    ? countryCodes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search) || c.country.toLowerCase().includes(search.toLowerCase()))
    : countryCodes;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex items-stretch gap-0 rounded-xl overflow-visible relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center gap-1.5 px-3 rounded-l-xl bg-brand-surface-elevated/80 border border-brand-border border-r-0 text-brand-text hover:bg-brand-surface-elevated transition-all cursor-pointer flex-shrink-0"
      >
        <span className="text-[1rem]">{selected.flag}</span>
        <span className="text-[0.75rem] text-brand-text-secondary" style={{ fontWeight: 500 }}>{selected.code}</span>
        <ChevronDown className={`w-3 h-3 text-brand-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="55 1234 5678"
        className="flex-1 min-w-0 px-3 py-2.5 rounded-r-xl bg-brand-surface-elevated/80 border border-brand-border border-l-0 text-brand-text text-[0.8125rem] placeholder:text-brand-muted/40 focus:outline-none transition-all"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-full max-h-[220px] rounded-xl border border-brand-border bg-brand-surface-elevated shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-brand-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-brand-bg/60 border border-brand-border text-[0.75rem] text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-[#25D366]/30"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && <div className="px-3 py-4 text-center text-[0.75rem] text-brand-muted">Sin resultados</div>}
              {filtered.map((c) => (
                <button
                  key={c.code + c.country}
                  type="button"
                  onClick={() => { onCountryCodeChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#25D366]/8 transition-colors cursor-pointer ${c.code === countryCode ? 'bg-[#25D366]/10' : ''}`}
                >
                  <span className="text-[0.9375rem]">{c.flag}</span>
                  <span className="text-[0.75rem] text-brand-text flex-1" style={{ fontWeight: 400 }}>{c.name}</span>
                  <span className="text-[0.6875rem] text-brand-muted" style={{ fontWeight: 500 }}>{c.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEAD FORM
   ═══════════════════════════════════════════════════════════ */

function LeadForm({ onCalendarStateChange, calendarState }: { onCalendarStateChange: (state: CalendarState) => void; calendarState: CalendarState }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const update = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    if (step === 1) return data.nombre && data.email && data.whatsapp && data.linkSocial && data.nicho;
    if (step === 2) return data.vendeProductos && data.tieneHighTicket && data.audienciaSize;
    if (step === 3) return data.temaReto && data.duracionReto && data.tieneContenido;
    if (step === 4) return data.inversion;
    if (step === 5) return data.timing && data.confirmaWhatsapp;
    return false;
  };

  const handleNext = () => {
    if (step === 4 && data.inversion === 'lower') {
      onCalendarStateChange('rejected');
      setDirection(1);
      setStep(step + 1);
      return;
    }
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    if ((calendarState === 'rejected' || calendarState === 'rejected-whatsapp') && step === 5) {
      onCalendarStateChange('locked');
    }
    setDirection(-1);
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (data.confirmaWhatsapp === 'no') {
      onCalendarStateChange('rejected-whatsapp');
      setSubmitted(true);
      return;
    }
    console.log('Lead data:', data);
    onCalendarStateChange('unlocked');
    setSubmitted(true);
  };

  if (submitted) {
    if (calendarState === 'rejected-whatsapp') {
      return (
        <div className="h-full flex items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-amber-500/20 bg-brand-surface/80 backdrop-blur-xl p-8 text-center w-full">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-[1.25rem] text-brand-text mb-3" style={{ fontWeight: 700 }}>Confirmación por WhatsApp requerida</h3>
            <p className="text-[0.875rem] text-brand-text-secondary mb-6" style={{ lineHeight: 1.7 }}>Entendemos. Si cambias de opinión, únete a nuestra lista de espera y te contactaremos cuando haya disponibilidad para tu reto.</p>
            <button className="px-6 py-3 rounded-xl border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 transition-all cursor-pointer" style={{ fontWeight: 600 }} onClick={() => window.open('https://byafluence.com', '_blank')}>
              Unirme a lista de espera
            </button>
          </motion.div>
        </div>
      );
    }

    if (calendarState === 'unlocked') {
      return (
        <div className="h-full flex items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-[#25D366]/20 bg-brand-surface/80 backdrop-blur-xl p-8 text-center w-full">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7 text-[#25D366]" />
            </div>
            <h3 className="text-[1.25rem] text-brand-text mb-2" style={{ fontWeight: 700 }}>Listo, {data.nombre}. Ahora agenda tu diagnóstico.</h3>
            <p className="text-[0.875rem] text-brand-text-secondary mb-1" style={{ lineHeight: 1.7 }}>Selecciona fecha y horario para tu sesión donde diseñaremos la estrategia de tu reto por WhatsApp.</p>
            <p className="text-[0.75rem] text-brand-muted" style={{ lineHeight: 1.6 }}>Recibirás confirmación por WhatsApp y email.</p>
          </motion.div>
        </div>
      );
    }
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full">
      {/* Stepper */}
      <div className="px-5 pt-5 pb-0 md:px-7 md:pt-7">
        <div className="flex items-center gap-1 mb-4">
          {stepsMeta.map((s, i) => {
            const Icon = s.icon;
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-[0.6875rem] whitespace-nowrap ${isActive ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' : isDone ? 'text-[#25D366]' : 'text-brand-muted/50'}`} style={{ fontWeight: isActive ? 600 : 400 }}>
                  {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < TOTAL_STEPS - 1 && <div className={`flex-1 h-px mx-1 ${isDone ? 'bg-[#25D366]/30' : 'bg-brand-border'}`} />}
              </div>
            );
          })}
        </div>

        <div className="mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.75rem] text-brand-muted" style={{ fontWeight: 500 }}>Paso {step} de {TOTAL_STEPS}</span>
            <span className="text-[0.6875rem] text-brand-muted/60" style={{ fontWeight: 400 }}>{stepsMeta[step - 1]?.time}</span>
          </div>
          <div className="h-1 rounded-full bg-brand-surface-elevated overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#25D366] to-[#34eb77]" initial={false} animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.5, ease: 'easeInOut' }} />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5 py-5 md:px-7 md:py-5 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} initial={{ opacity: 0, x: direction * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -30 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[1.0625rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>Cuéntanos sobre ti</h3>
                <FormField label="Nombre completo" required>
                  <input type="text" value={data.nombre} onChange={(e) => update('nombre', e.target.value)} placeholder="Tu nombre" className="form-input" />
                </FormField>
                <FormField label="Email" required>
                  <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@email.com" className="form-input" />
                </FormField>
                <FormField label="WhatsApp" required>
                  <WhatsAppInput countryCode={data.countryCode} phone={data.whatsapp} onCountryCodeChange={(code) => update('countryCode', code)} onPhoneChange={(phone) => update('whatsapp', phone)} />
                </FormField>
                <FormField label="Link IG / TikTok / YouTube" required>
                  <input type="url" value={data.linkSocial} onChange={(e) => update('linkSocial', e.target.value)} placeholder="https://instagram.com/tu_perfil" className="form-input" />
                </FormField>
                <FormField label="Nicho principal" required>
                  <select value={data.nicho} onChange={(e) => update('nicho', e.target.value)} className="form-input appearance-none cursor-pointer">
                    <option value="" style={{ background: '#1C1C26', color: '#71717A' }}>Seleccionar nicho</option>
                    {nichos.map((n) => (<option key={n} value={n} style={{ background: '#1C1C26', color: '#F5F5F7' }}>{n}</option>))}
                  </select>
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-[1.0625rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>Tu negocio digital</h3>
                <FormField label="¿Vendes productos digitales actualmente?" required>
                  <div className="grid grid-cols-2 gap-2">
                    {['Sí, vendo cursos/programas', 'No, aún no'].map((opt) => (
                      <RadioButton key={opt} label={opt} selected={data.vendeProductos === opt} onClick={() => update('vendeProductos', opt)} />
                    ))}
                  </div>
                </FormField>
                <FormField label="¿Tienes una oferta high-ticket ($1,000+)?" required>
                  <div className="grid grid-cols-2 gap-2">
                    {['Sí, ya la tengo', 'No, pero quiero crear una', 'Estoy pensando en ello'].map((opt) => (
                      <RadioButton key={opt} label={opt} selected={data.tieneHighTicket === opt} onClick={() => update('tieneHighTicket', opt)} />
                    ))}
                  </div>
                </FormField>
                <FormField label="Tamaño de tu audiencia" required>
                  <div className="grid grid-cols-2 gap-2">
                    {audienceSizes.map((s) => (<RadioButton key={s} label={s} selected={data.audienciaSize === s} onClick={() => update('audienciaSize', s)} />))}
                  </div>
                </FormField>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-[1.0625rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>Sobre tu reto ideal</h3>
                <FormField label="¿Sobre qué tema sería tu reto?" required>
                  <input type="text" value={data.temaReto} onChange={(e) => update('temaReto', e.target.value)} placeholder='Ej: "Reto de abdomen en 21 días", "Finanzas en orden"...' className="form-input" />
                </FormField>
                <FormField label="Duración ideal del reto" required>
                  <div className="flex flex-col gap-2">
                    {duraciones.map((d) => (<RadioButton key={d} label={d} selected={data.duracionReto === d} onClick={() => update('duracionReto', d)} />))}
                  </div>
                </FormField>
                <FormField label="¿Tienes contenido o material previo?" required>
                  <div className="flex flex-col gap-2">
                    {contenidoOptions.map((c) => (<RadioButton key={c} label={c} selected={data.tieneContenido === c} onClick={() => update('tieneContenido', c)} />))}
                  </div>
                </FormField>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-[1.0625rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>Inversión</h3>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#25D366]/6 border border-[#25D366]/15">
                  <Info className="w-4 h-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                  <p className="text-[0.8125rem] text-brand-text-secondary" style={{ lineHeight: 1.7 }}>
                    Los retos con tutor IA de Afluence comienzan desde <span className="text-[#25D366]" style={{ fontWeight: 600 }}>USD $7,000</span>. Incluyen estrategia, IA entrenada, dashboard y funnel a high-ticket.
                  </p>
                </div>
                <FormField label="¿Estás listo para invertir en tu reto?" required>
                  <div className="flex flex-col gap-2">
                    {inversiones.map((inv) => (
                      <RadioButton key={inv.value} label={inv.label} selected={data.inversion === inv.value} onClick={() => update('inversion', inv.value)} variant={inv.value === 'lower' && data.inversion === 'lower' ? 'warning' : undefined} />
                    ))}
                  </div>
                </FormField>
                {data.inversion === 'lower' && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
                    <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[0.75rem] text-amber-400/80" style={{ lineHeight: 1.6 }}>Al continuar serás redirigido a nuestra lista de espera. El calendario no se desbloqueará.</p>
                  </motion.div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-5">
                {calendarState === 'rejected' ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                      <DollarSign className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-[1.125rem] text-brand-text mb-3" style={{ fontWeight: 700 }}>Nuestros retos con IA comienzan desde USD $7,000</h3>
                    <p className="text-[0.8125rem] text-brand-text-secondary mb-6" style={{ lineHeight: 1.7 }}>Entendemos. Únete a nuestra lista de espera y te avisaremos cuando tengamos opciones más accesibles.</p>
                    <button className="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(37,211,102,0.3)]" style={{ fontWeight: 600 }} onClick={() => window.open('https://byafluence.com', '_blank')}>
                      Unirme a lista de espera
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[1.0625rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>Último paso</h3>
                    <FormField label="¿Cuándo te gustaría lanzar tu reto?" required>
                      <div className="grid grid-cols-2 gap-2">
                        {timings.map((t) => (<RadioButton key={t} label={t} selected={data.timing === t} onClick={() => update('timing', t)} icon={<Clock className="w-3.5 h-3.5" />} />))}
                      </div>
                    </FormField>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#25D366]/6 border border-[#25D366]/15">
                      <MessageCircle className="w-4 h-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                      <p className="text-[0.8125rem] text-brand-text-secondary" style={{ lineHeight: 1.7 }}>
                        Para agendar, debes <span className="text-brand-text" style={{ fontWeight: 500 }}>confirmar por WhatsApp</span> que estás listo para comenzar tu proyecto de reto.
                      </p>
                    </div>
                    <FormField label="Confirmación" required>
                      <div className="flex flex-col gap-2">
                        {whatsappOptions.map((opt) => (
                          <RadioButton key={opt.value} label={opt.label} selected={data.confirmaWhatsapp === opt.value} onClick={() => update('confirmaWhatsapp', opt.value)} variant={opt.value === 'no' && data.confirmaWhatsapp === 'no' ? 'warning' : undefined} />
                        ))}
                      </div>
                    </FormField>
                    {data.confirmaWhatsapp === 'no' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
                        <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[0.75rem] text-amber-400/80" style={{ lineHeight: 1.6 }}>Sin confirmación por WhatsApp no podemos agendar. Podrás unirte a la lista de espera.</p>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!(step === 5 && calendarState === 'rejected') && !submitted && (
        <div className="px-5 pb-5 pt-0 md:px-7 md:pb-7 border-t border-brand-border">
          <div className="flex items-center justify-between pt-5">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[0.8125rem] transition-all ${step === 1 ? 'border-brand-border/30 text-brand-muted/30 cursor-not-allowed' : 'border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-border-hover hover:bg-brand-surface/50 cursor-pointer'}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.8125rem] text-white transition-all ${canNext() ? 'bg-[#25D366] hover:bg-[#1fb855] cursor-pointer shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] active:scale-[0.98]' : 'bg-brand-muted/20 cursor-not-allowed'}`}
              style={{ fontWeight: 600 }}
            >
              {step === TOTAL_STEPS ? (data.confirmaWhatsapp === 'no' ? 'Lista de espera' : 'Desbloquear calendario') : 'Continuar'}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR BOOKING
   ═══════════════════════════════════════════════════════════ */

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

function CalendarBooking({ calendarState }: { calendarState: CalendarState }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showUnlockedBadge, setShowUnlockedBadge] = useState(false);
  const [booked, setBooked] = useState(false);

  const isLocked = calendarState === 'locked';
  const isRejected = calendarState === 'rejected' || calendarState === 'rejected-whatsapp';
  const isUnlocked = calendarState === 'unlocked';

  useMemo(() => {
    if (isUnlocked && !booked) {
      setShowUnlockedBadge(true);
      const timer = setTimeout(() => setShowUnlockedBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, booked]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    return date < today || dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
  };

  const handleDateClick = (day: number) => {
    if (!isUnlocked || isDateDisabled(day)) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setSelectedTime(null);
  };

  const canGoPrev = !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const prevMonth = () => {
    if (!canGoPrev || !isUnlocked) return;
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
  };

  const nextMonth = () => {
    if (!isUnlocked) return;
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS_ES[selectedDate.getMonth()]}`;
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) setBooked(true);
  };

  if (booked) {
    return (
      <div className="rounded-2xl border border-brand-success/20 bg-brand-surface/60 backdrop-blur-2xl p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mx-auto mb-5">
          <CalendarCheck className="w-7 h-7 text-brand-success" />
        </div>
        <h3 className="text-[1.25rem] text-brand-text mb-2" style={{ fontWeight: 700 }}>Reunión agendada</h3>
        <p className="text-[0.875rem] text-brand-text-secondary mb-4" style={{ lineHeight: 1.7 }}>{formatSelectedDate()} a las {selectedTime}</p>
        <p className="text-[0.75rem] text-brand-muted" style={{ lineHeight: 1.6 }}>Recibirás confirmación por WhatsApp y un correo con los detalles.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden h-full flex flex-col">
      <div className={`flex-1 p-5 md:p-6 transition-all duration-700 ${isLocked || isRejected ? 'blur-[14px] pointer-events-none select-none' : ''}`}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[0.875rem] text-brand-text" style={{ fontWeight: 600 }}>Sesión estratégica</p>
            <div className="flex items-center gap-2 text-[0.6875rem] text-brand-muted"><Clock className="w-3 h-3" /><span>45 min</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} disabled={!canGoPrev} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${canGoPrev ? 'hover:bg-brand-surface-elevated text-brand-text-secondary hover:text-brand-text cursor-pointer' : 'text-brand-muted/30 cursor-not-allowed'}`}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[0.8125rem] text-brand-text" style={{ fontWeight: 600 }}>{MONTHS_ES[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-surface-elevated text-brand-accent hover:text-brand-accent-hover transition-all cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {DAYS_ES.map((d) => (<div key={d} className="text-center text-[0.625rem] text-brand-muted py-1.5" style={{ fontWeight: 600 }}>{d}</div>))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const disabled = isDateDisabled(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled || !isUnlocked}
                className={`relative w-full aspect-square rounded-full flex items-center justify-center text-[0.75rem] transition-all ${disabled ? 'text-brand-muted/20 cursor-not-allowed' : selected ? 'bg-brand-accent text-white shadow-[0_0_15px_rgba(108,92,231,0.4)] cursor-pointer' : todayMark ? 'text-brand-accent border border-brand-accent/30 cursor-pointer hover:bg-brand-accent/10' : 'text-brand-text-secondary hover:bg-brand-surface-elevated cursor-pointer'}`}
                style={{ fontWeight: selected || todayMark ? 600 : 400 }}
              >
                {day}
                {todayMark && !selected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-accent" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-brand-surface-elevated/50 border border-brand-border">
            <Globe className="w-3 h-3 text-brand-muted" />
            <span className="text-[0.6875rem] text-brand-text-secondary">GMT-06:00 America/Mexico_City</span>
          </div>
        </div>

        <AnimatePresence>
          {isUnlocked && selectedDate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="mt-4 pt-3 border-t border-brand-border">
                <p className="text-[0.75rem] text-brand-muted mb-2" style={{ fontWeight: 500 }}>{formatSelectedDate()} — Horarios disponibles</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((time) => {
                    const isActive = selectedTime === time;
                    return (
                      <button key={time} onClick={() => setSelectedTime(time)} className={`px-2 py-2 rounded-lg border text-[0.6875rem] transition-all cursor-pointer text-center whitespace-nowrap ${isActive ? 'border-brand-accent bg-brand-accent text-white shadow-[0_0_15px_rgba(108,92,231,0.3)]' : 'border-brand-accent/25 text-brand-accent hover:bg-brand-accent/10'}`} style={{ fontWeight: 500 }}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUnlocked && selectedDate && selectedTime && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4">
              <button onClick={handleConfirm} className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-[0.8125rem] transition-all cursor-pointer shadow-[0_0_30px_rgba(108,92,231,0.4)] hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] active:scale-[0.98]" style={{ fontWeight: 600 }}>
                Confirmar — {formatSelectedDate()} a las {selectedTime}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-surface-elevated/80 border border-brand-border flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Lock className="w-6 h-6 text-brand-muted" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>Completa el formulario para desbloquear</h4>
            <p className="text-[0.8125rem] text-brand-muted max-w-[260px]" style={{ lineHeight: 1.6 }}>Toma menos de 1 minuto.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calendarState === 'rejected' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>Nuestros desarrollos comienzan desde USD $7,000</h4>
            <p className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5" style={{ lineHeight: 1.6 }}>Actualmente no podemos desbloquear el calendario para este rango de inversión.</p>
            <button className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]" style={{ fontWeight: 600 }} onClick={() => window.open('https://byafluence.com', '_blank')}>
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calendarState === 'rejected-whatsapp' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <MessageCircle className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-[1rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>Reservamos reuniones solo para proyectos confirmados</h4>
            <p className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5" style={{ lineHeight: 1.6 }}>La confirmación por WhatsApp es necesaria para revisar tu proyecto antes de la sesión.</p>
            <button className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]" style={{ fontWeight: 600 }} onClick={() => window.open('https://byafluence.com', '_blank')}>
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnlockedBadge && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-success/15 border border-brand-success/25 backdrop-blur-xl shadow-[0_4px_30px_rgba(16,185,129,0.2)]">
              <CalendarCheck className="w-4 h-4 text-brand-success" />
              <span className="text-[0.75rem] text-brand-success whitespace-nowrap" style={{ fontWeight: 600 }}>Listo para agendar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOKING SECTION (exported)
   ═══════════════════════════════════════════════════════════ */

export function BookingSection() {
  const [calendarState, setCalendarState] = useState<CalendarState>('locked');

  return (
    <section id="formulario" className="relative py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-accent/4 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>Siguiente paso</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>Aplica para tu reto</h2>
          <p className="mt-4 text-[0.9375rem] text-brand-text-secondary max-w-[520px] mx-auto" style={{ lineHeight: 1.7 }}>
            Completa el diagnóstico y desbloquea el calendario. Evaluaremos tu nicho, audiencia y oferta para diseñar el reto perfecto que convierta seguidores en clientes high-ticket.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 md:gap-6 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5 }} className="w-full lg:w-[58.33%] min-h-[580px]">
            <LeadForm calendarState={calendarState} onCalendarStateChange={setCalendarState} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full lg:w-[41.67%] lg:sticky lg:top-24">
            <CalendarBooking calendarState={calendarState} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
