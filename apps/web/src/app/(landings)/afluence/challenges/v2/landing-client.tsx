'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  MessageCircle,
  Menu,
  X,
  Shield,
  Target,
  Brain,
  Rocket,
  Zap,
  TrendingUp,
  Check,
  ArrowDown,
  DollarSign,
  Users,
  Flame,
  Trophy,
  Clock,
  BarChart3,
  Sparkles,
  Settings,
  Headphones,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingSection } from './booking';
import logoHeader from './logo-header.jpeg';
import gymWsp from './gym-wsp.jpeg';

/* ═══════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════ */

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'Ventajas', id: 'ventajas' },
    { label: 'Reto vs Curso', id: 'comparativa' },
    { label: 'Cómo funciona', id: 'como-funciona' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-brand-bg/80 backdrop-blur-2xl border-b border-brand-border shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1240px] px-4 md:px-20 flex items-center justify-between h-[72px]">
        <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 group cursor-pointer">
          <Image src={logoHeader} alt="Afluence" height={36} className="w-auto" />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="relative text-[0.875rem] text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        <button
          onClick={() => scrollTo('formulario')}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white text-[0.875rem] transition-all cursor-pointer shadow-[0_0_20px_rgba(108,92,231,0.3)] hover:shadow-[0_0_30px_rgba(108,92,231,0.5)] active:scale-[0.98]"
          style={{ fontWeight: 600 }}
        >
          Agendar reunión
        </button>

        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => scrollTo('formulario')}
            className="px-3 py-2 rounded-lg bg-brand-accent text-white text-[0.75rem] cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Agendar
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-brand-text cursor-pointer">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-brand-bg/95 backdrop-blur-2xl border-t border-brand-border overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(link.id)}
                  className="text-left px-4 py-3 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface-elevated transition-colors cursor-pointer"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => scrollTo('formulario')}
                className="mt-2 px-4 py-3 rounded-lg bg-brand-accent text-white text-center cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                Agendar reunión
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════ */

/* Video thumbnail image */

const chatMessages = [
  {
    id: 1,
    type: 'bot' as const,
    content: (
      <>
        <p className="text-[0.75rem] text-gray-800" style={{ lineHeight: 1.5 }}>
          Buenos días Ana! Dia 14 de 21. Ayer hiciste 3 series de sentadillas. Hoy vamos a subir la intensidad.
        </p>
        <p className="text-[0.75rem] text-gray-800 mt-1" style={{ lineHeight: 1.5 }}>
          Tu plan de hoy (personalizado según tu progreso):
        </p>
        <div className="mt-1.5 text-[0.7rem] text-gray-700 space-y-0.5">
          <p>1. Sentadillas 4x12 (+1 serie)</p>
          <p>2. Plancha 3x45s (subimos 15s)</p>
          <p>3. Burpees 3x8 (nuevo)</p>
        </div>
        <div className="mt-2 relative rounded-lg overflow-hidden">
          <Image src={gymWsp} alt="Personal trainer" className="w-full h-[120px] object-cover brightness-[0.8]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg width="14" height="16" viewBox="0 0 10 12" fill="#008069">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/65">
            <span className="text-[0.6rem] text-white" style={{ fontWeight: 500 }}>2:15</span>
          </div>
          <div className="absolute bottom-1.5 left-1.5">
            <span className="text-[0.6rem] text-white drop-shadow-lg" style={{ fontWeight: 600 }}>Rutina Dia 14 - Tu trainer</span>
          </div>
        </div>
      </>
    ),
    time: '8:00 AM',
    delay: 0.8,
  },
  {
    id: 2,
    type: 'user' as const,
    content: (
      <p className="text-[0.75rem] text-gray-800" style={{ lineHeight: 1.5 }}>
        Listo! Ya terminé todo. Los burpees me mataron pero los hice completos
      </p>
    ),
    time: '9:23 AM ✓✓',
    delay: 4.0,
  },
  {
    id: 3,
    type: 'bot' as const,
    content: (
      <>
        <p className="text-[0.75rem] text-gray-800" style={{ lineHeight: 1.5 }}>
          Increíble Ana! 14 días seguidos sin fallar — estás en el top 5% del reto.
        </p>
        <p className="text-[0.75rem] text-gray-800 mt-1" style={{ lineHeight: 1.5 }}>
          Con tu nivel de compromiso, creo que el programa de 12 semanas sería perfecto para ti. ¿Te gustaría que te cuente más?
        </p>
      </>
    ),
    time: '9:23 AM',
    delay: 6.5,
  },
  {
    id: 4,
    type: 'user' as const,
    content: (
      <p className="text-[0.75rem] text-gray-800" style={{ lineHeight: 1.5 }}>
        Síii! Mándame info, ya vi que sí puedo con esto
      </p>
    ),
    time: '9:24 AM ✓✓',
    delay: 9.0,
  },
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <motion.div className="w-[6px] h-[6px] rounded-full bg-gray-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
          <motion.div className="w-[6px] h-[6px] rounded-full bg-gray-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
          <motion.div className="w-[6px] h-[6px] rounded-full bg-gray-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    chatMessages.forEach((msg) => {
      const typingDelay = msg.delay - 0.8;
      if (typingDelay > 0) {
        timers.push(setTimeout(() => setShowTyping(true), typingDelay * 1000));
      }
      timers.push(
        setTimeout(() => {
          setShowTyping(false);
          setVisibleMessages((prev) => [...prev, msg.id]);
        }, msg.delay * 1000)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="hero" className="relative pt-[72px] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#25D366]/5 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 flex flex-col gap-6 md:gap-8 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#25D366]/20 bg-[#25D366]/8">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="text-[0.75rem] text-[#25D366]" style={{ fontWeight: 500 }}>Curso por WhatsApp + Tutor IA</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[2.25rem] md:text-[3.25rem] lg:text-[3.75rem] tracking-tight text-brand-text"
              style={{ fontWeight: 800, lineHeight: 1.08 }}
            >
              Tu curso tiene <span className="text-brand-error">12%</span> de finalización.{' '}
              <br className="hidden md:block" />
              Nuestros retos:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] via-[#34eb77] to-[#25D366]">92%</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[1rem] md:text-[1.125rem] text-brand-text-secondary max-w-[560px] mx-auto lg:mx-0"
              style={{ lineHeight: 1.7 }}
            >
              Retos por WhatsApp con tutor IA que hyper-personaliza la experiencia de cada participante. Tus seguidores terminan, obtienen resultados reales y{' '}
              <span className="text-brand-text" style={{ fontWeight: 500 }}>el 10%–30% compra tu programa high-ticket al finalizar</span>.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => scrollTo('formulario')}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_50px_rgba(37,211,102,0.5)] active:scale-[0.98]"
                style={{ fontWeight: 600 }}
              >
                Lanzar mi reto en 3 semanas
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('ventajas')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-border hover:border-brand-border-hover text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer bg-transparent hover:bg-brand-surface/50"
              >
                ¿Por qué no un curso?
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-2">
              {[
                { value: '92%', label: 'finalización' },
                { value: '10–30%', label: 'compra high-ticket' },
                { value: '<20s', label: 'respuesta IA' },
                { value: '3 sem', label: 'listo para lanzar' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[1.125rem] text-[#25D366]" style={{ fontWeight: 700 }}>{stat.value}</span>
                  <span className="text-[0.75rem] text-brand-muted">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* WhatsApp Chat Mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.95, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 max-w-[420px] w-full">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#25D366]/20 via-[#25D366]/10 to-[#25D366]/20 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-brand-border bg-white shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <div className="bg-[#008069] px-5 py-2 flex items-center justify-between">
                  <span className="text-[0.65rem] text-white/80">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3.5 h-2 rounded-sm bg-white/60" />
                    <div className="w-1 h-2 rounded-sm bg-white/40" />
                  </div>
                </div>
                <div className="bg-[#008069] px-4 pb-3 flex items-center gap-3">
                  <div className="w-2 h-4 flex items-center">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="white" opacity="0.9"><path d="M7 1L1 7l6 6" /></svg>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center">
                    <span className="text-white text-[0.7rem]" style={{ fontWeight: 700 }}>IA</span>
                  </div>
                  <div>
                    <p className="text-white text-[0.8125rem]" style={{ fontWeight: 600 }}>Reto Fitness 21D</p>
                    <p className="text-white/70 text-[0.65rem]">Tutor IA personalizado</p>
                  </div>
                </div>

                <div
                  className="bg-[#efeae2] px-3 py-4 flex flex-col gap-2 min-h-[380px] max-h-[480px] overflow-y-auto overflow-x-hidden"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                >
                  <AnimatePresence>
                    {chatMessages.map((msg) => {
                      if (!visibleMessages.includes(msg.id)) return null;
                      const isBot = msg.type === 'bot';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 16, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`${isBot ? 'bg-white rounded-xl rounded-tl-sm' : 'bg-[#d9fdd3] rounded-xl rounded-tr-sm'} px-3 py-2 ${isBot ? 'max-w-[85%]' : 'max-w-[80%]'} shadow-sm`}>
                            {msg.content}
                            <p className="text-[0.6rem] text-gray-400 mt-1.5 text-right">{msg.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showTyping && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                        <TypingIndicator />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2 border-t border-gray-200">
                  <div className="flex-1 bg-white rounded-full px-4 py-2">
                    <span className="text-[0.7rem] text-gray-400">Escribe un mensaje</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partner Logos */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-col gap-3 mt-16 text-center lg:text-left">
          <p className="text-[0.8125rem] text-brand-muted uppercase tracking-[0.25em]" style={{ fontWeight: 600 }}>Partners oficiales de</p>
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center lg:justify-start gap-x-12 gap-y-4 mt-2">
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <span className="text-[1.75rem] leading-none" style={{ fontFamily: 'system-ui' }}>&#8734;</span>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Meta Business</span>
            </div>
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="8" y="2" width="3" height="20" rx="1.5" /><rect x="13" y="2" width="3" height="20" rx="1.5" /></svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>ElevenLabs</span>
            </div>
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fillOpacity="0.7" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillOpacity="0.5" />
                <path d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.13-1.43.36-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l2.85-2.22.81-.62z" fillOpacity="0.6" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillOpacity="0.8" />
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Google for Startups</span>
            </div>
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="26" height="26" viewBox="0 0 21 21" fill="currentColor">
                <rect x="0" y="0" width="10" height="10" fillOpacity="0.7" /><rect x="11" y="0" width="10" height="10" fillOpacity="0.5" />
                <rect x="0" y="11" width="10" height="10" fillOpacity="0.6" /><rect x="11" y="11" width="10" height="10" fillOpacity="0.8" />
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Microsoft for Startups</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAIN POINTS
   ═══════════════════════════════════════════════════════════ */

const pains = [
  { stat: '12%', text: 'de tus alumnos terminan tu curso. El otro 88% pagó, no lo abrió y jamás te recomendó.' },
  { stat: '$0', text: 'ingresos después de la venta. Tu alumno compró, no terminó, y nunca vas a poder venderle algo más.' },
  { stat: '0', text: 'personalización. Todos tus alumnos reciben exactamente lo mismo — el avanzado se aburre, el novato se pierde.' },
  { stat: '6 meses', text: 'crear un curso. Entre grabar, editar, subir y lanzar, pasaste medio año para que nadie lo termine.' },
  { stat: '1 email', text: 'se abre de cada 5 que envías. Tu secuencia de seguimiento post-curso vive en la carpeta de spam.' },
  { stat: '0 datos', text: 'sobre el progreso real de cada alumno. No sabes quién va bien, quién se atascó ni quién está listo para comprar más.' },
];

function PainPoints() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-error" style={{ fontWeight: 600 }}>La verdad sobre tu curso</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Tu curso no tiene un problema de ventas.
            <br className="hidden md:block" />
            <span className="text-brand-error">Tiene un problema de resultados.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-[960px] mx-auto">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 md:p-6 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/70 hover:border-brand-error/20 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-brand-error/10 border border-brand-error/20 flex items-center justify-center group-hover:bg-brand-error/15 transition-colors">
                  <span className="text-[0.8125rem] text-brand-error" style={{ fontWeight: 700 }}>{pain.stat}</span>
                </div>
              </div>
              <p className="text-[0.9375rem] text-brand-text-secondary group-hover:text-brand-text transition-colors" style={{ lineHeight: 1.6 }}>{pain.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-14 mb-8">
          <p className="text-[1.125rem] md:text-[1.25rem] text-brand-text-secondary max-w-[640px] mx-auto" style={{ lineHeight: 1.7 }}>
            ¿Y si en vez de un curso que nadie termina, le dieras a tu audiencia un{' '}
            <span className="text-[#25D366]" style={{ fontWeight: 600 }}>reto por WhatsApp con un tutor IA</span>{' '}
            que los acompaña cada día, adapta el contenido a su nivel y los convierte en clientes high-ticket?
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="flex justify-center">
          <button onClick={() => scrollTo('ventajas')} className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-[0.98]" style={{ fontWeight: 600 }}>
            Ver cómo funciona el reto
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES (ADVANTAGES)
   ═══════════════════════════════════════════════════════════ */

const advantages = [
  { icon: Target, title: '92% tasa de finalización', desc: 'Contenido diario en WhatsApp, bite-sized, con seguimiento personalizado. No es un PDF que acumula polvo — es una conversación que engancha.', highlight: '92%' },
  { icon: Brain, title: 'Tutor IA hyper-personalizado', desc: 'Cada participante recibe feedback único basado en sus respuestas, progreso y nivel. La IA adapta el contenido en tiempo real — como un coach 1:1 pero escalable.', highlight: '1:1' },
  { icon: TrendingUp, title: '10%–30% compra high-ticket después', desc: 'El reto genera confianza, demuestra resultados y calienta al lead. Al terminar, tu oferta premium no es una venta fría — es la siguiente decisión lógica.', highlight: '10–30%' },
  { icon: MessageCircle, title: 'Donde tu audiencia ya vive', desc: 'WhatsApp tiene 98% de tasa de apertura. No necesitan descargar otra app, crear otra cuenta ni recordar otra contraseña. Ya están ahí.', highlight: '98%' },
  { icon: Rocket, title: 'Listo en 3 semanas', desc: 'Mientras tu competencia lleva 6 meses grabando un curso, tú ya lanzaste, validaste y estás vendiendo high-ticket con resultados comprobados.', highlight: '3 sem' },
  { icon: Zap, title: '100% en piloto automático', desc: 'La IA guía, motiva, responde dudas, da seguimiento y sugiere tu programa premium. Tú no tocas WhatsApp — solo ves los resultados.', highlight: '24/7' },
];

function Services() {
  return (
    <section id="ventajas" className="relative py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Por qué funciona</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            6 razones por las que un reto destruye a un curso
          </h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[560px] mx-auto" style={{ lineHeight: 1.7 }}>
            No es magia. Es WhatsApp + IA + micro-contenido diario + hyper-personalización. La combinación que tu curso nunca pudo ofrecer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {advantages.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative flex flex-col p-6 md:p-7 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/70 hover:border-[#25D366]/25 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#25D366]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 border border-[#25D366]/15 flex items-center justify-center group-hover:bg-[#25D366]/20 group-hover:border-[#25D366]/25 transition-all duration-300">
                      <Icon className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <span className="text-[1.25rem] text-[#25D366]/30 group-hover:text-[#25D366]/50 transition-colors" style={{ fontWeight: 800 }}>{item.highlight}</span>
                  </div>
                  <h3 className="text-[1.0625rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>{item.title}</h3>
                  <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   RETO VS CURSO
   ═══════════════════════════════════════════════════════════ */

const comparisons = [
  { feature: 'Tasa de finalización', reto: '92%', curso: '12%' },
  { feature: 'Personalización', reto: 'IA adapta a cada persona', curso: 'Mismo contenido para todos' },
  { feature: 'Tiempo de creación', reto: '3 semanas', curso: '3–6 meses' },
  { feature: 'Conversión a high-ticket', reto: '10–30% post-reto', curso: '<5%' },
  { feature: 'Tasa de apertura', reto: '98% (WhatsApp)', curso: '20% (email)' },
  { feature: 'Engagement diario', reto: 'Conversación con IA', curso: 'Video que nadie ve' },
  { feature: 'Seguimiento individual', reto: 'Automático por IA', curso: 'Manual o inexistente' },
  { feature: 'Datos del alumno', reto: 'Progreso en tiempo real', curso: 'Solo % de avance' },
  { feature: 'Inversión del participante', reto: 'Baja (puerta de entrada)', curso: 'Media-alta (barrera)' },
  { feature: 'Escalabilidad', reto: 'Ilimitada (IA 24/7)', curso: 'Limitada sin soporte' },
];

function RetoVsCurso() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="comparativa" className="relative py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Reto vs Curso</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>No es opinión. Son números.</h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[560px] mx-auto" style={{ lineHeight: 1.7 }}>
            Compara lado a lado y decide: ¿seguir invirtiendo en algo que nadie termina, o lanzar algo que transforma y vende?
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-[800px] mx-auto">
          <div className="rounded-2xl border border-brand-border bg-brand-surface/40 backdrop-blur-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr] items-center px-4 md:px-7 py-4 border-b border-brand-border bg-brand-surface/60">
              <span />
              <div className="text-center">
                <span className="text-[0.75rem] md:text-[0.8125rem] text-[#25D366] flex items-center justify-center gap-1.5" style={{ fontWeight: 700 }}>
                  <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />Reto WhatsApp + IA
                </span>
              </div>
              <div className="text-center">
                <span className="text-[0.75rem] md:text-[0.8125rem] text-brand-muted" style={{ fontWeight: 500 }}>Curso tradicional</span>
              </div>
            </div>

            {comparisons.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`grid grid-cols-[1fr_1fr_1fr] items-center px-4 md:px-7 py-3.5 ${i < comparisons.length - 1 ? 'border-b border-brand-border/50' : ''} hover:bg-brand-surface/40 transition-colors`}
              >
                <span className="text-[0.75rem] md:text-[0.8125rem] text-brand-text-secondary" style={{ fontWeight: 500 }}>{row.feature}</span>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-[#25D366]" /></div>
                  <span className="text-[0.6875rem] md:text-[0.75rem] text-[#25D366]" style={{ fontWeight: 500 }}>{row.reto}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand-error/10 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-brand-error/60" /></div>
                  <span className="text-[0.6875rem] md:text-[0.75rem] text-brand-muted" style={{ fontWeight: 400 }}>{row.curso}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-5 text-[0.75rem] text-brand-muted/60 italic">Datos basados en promedios de la industria e-learning y resultados reales de retos Afluence.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex justify-center mt-12">
          <button onClick={() => scrollTo('formulario')} className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-[0.98]" style={{ fontWeight: 600 }}>
            Quiero estos números para mi negocio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HIGH-TICKET FUNNEL
   ═══════════════════════════════════════════════════════════ */

const funnelSteps = [
  { icon: MessageCircle, color: '#25D366', label: 'PUERTA DE ENTRADA', title: 'Reto por WhatsApp', desc: 'Precio bajo ($27–$97). Barrera mínima. Tu audiencia entra masivamente porque es WhatsApp, es corto y suena divertido.', metric: '100% de inscritos' },
  { icon: Brain, color: '#25D366', label: 'TRANSFORMACIÓN', title: 'Tutor IA personalizado', desc: 'La IA adapta cada día al nivel del participante. Les da feedback real, los motiva y demuestra que tu método FUNCIONA. Resultado: confianza absoluta.', metric: '92% lo terminan' },
  { icon: Users, color: '#a78bfa', label: 'CALIFICACIÓN', title: 'Lead ultra-caliente', desc: 'Al día 14-21, la IA detecta quién tuvo mejores resultados y está listo para más. Les presenta tu oferta premium de forma natural — no es venta, es la siguiente evolución.', metric: '10–30% quiere más' },
  { icon: DollarSign, color: '#f59e0b', label: 'CONVERSIÓN', title: 'Venta high-ticket', desc: 'Mentoría, programa de 12 semanas, mastermind, lo que tú vendas. El participante ya confía en ti, ya vio resultados y ya tiene momentum. No es venta fría.', metric: '$2K–$10K+ ticket' },
];

function HighTicketFunnel() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>El funnel que vende solo</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight max-w-[700px] mx-auto" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Reto de $47 → Programa de $2,000.
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-brand-accent">Así funciona un product Funnel.</span>
          </h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[580px] mx-auto" style={{ lineHeight: 1.7 }}>
            El reto no es el negocio — es la puerta de entrada. La hyper-personalización de la IA convierte participantes en clientes premium sin que tú levantes un dedo.
          </p>
        </div>

        <div className="max-w-[640px] mx-auto flex flex-col gap-0">
          {funnelSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex gap-5 p-5 md:p-6 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/60 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300" style={{ backgroundColor: `${step.color}10`, borderColor: `${step.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.6rem] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border inline-block mb-2" style={{ color: step.color, borderColor: `${step.color}30`, backgroundColor: `${step.color}08`, fontWeight: 600 }}>
                      {step.label}
                    </span>
                    <h3 className="text-[1.0625rem] text-brand-text mb-1.5" style={{ fontWeight: 600 }}>{step.title}</h3>
                    <p className="text-[0.8125rem] text-brand-muted mb-3" style={{ lineHeight: 1.7 }}>{step.desc}</p>
                    <span className="text-[0.75rem] text-brand-text-secondary" style={{ fontWeight: 600 }}>{step.metric}</span>
                  </div>
                </motion.div>
                {i < funnelSteps.length - 1 && (
                  <div className="flex justify-center py-2"><ArrowDown className="w-5 h-5 text-brand-muted/30" /></div>
                )}
              </div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="max-w-[640px] mx-auto mt-8 p-6 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5">
          <div className="text-center">
            <p className="text-[1rem] text-brand-text" style={{ fontWeight: 600, lineHeight: 1.6 }}>
              Ejemplo real: 500 personas entran al reto de $47.<br />460 lo terminan. 92 quieren tu programa de $2,000.
            </p>
            <p className="mt-2 text-[1.5rem] text-[#25D366]" style={{ fontWeight: 800 }}>= $184,000 en revenue potencial</p>
            <p className="mt-1 text-[0.75rem] text-brand-muted">+ $23,500 del reto. Todo automatizado. Sin lanzamiento estresante.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }} className="flex justify-center mt-10">
          <button onClick={() => scrollTo('formulario')} className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-[0.98]" style={{ fontWeight: 600 }}>
            Construir mi funnel de retos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOWCASE
   ═══════════════════════════════════════════════════════════ */

const retos = [
  { icon: Flame, title: 'Reto Fitness 21 Días', nicho: 'Fitness & Salud', duration: '21 días', result: '92% finalización · 38% compró programa 12 semanas', color: '#ef4444', preview: '"Día 15: tu rutina de hoy incluye 4 series de..."' },
  { icon: Users, title: 'Reto Nutrición Consciente', nicho: 'Nutrición', duration: '14 días', result: '89% finalización · 31% compró mentoría grupal', color: '#22c55e', preview: '"Buenos días! Hoy preparamos tu plan semanal personalizado..."' },
  { icon: TrendingUp, title: 'Reto Finanzas en Control', nicho: 'Finanzas Personales', duration: '7 días', result: '95% finalización · 42% compró programa premium', color: '#f59e0b', preview: '"Tu diagnóstico financiero está listo. Según tus gastos..."' },
  { icon: Trophy, title: 'Reto Productividad Extrema', nicho: 'Coaching & Negocios', duration: '14 días', result: '88% finalización · 29% entró a mastermind', color: '#8b5cf6', preview: '"Día 8: ayer completaste 3 de 4 tareas. Hoy vamos por..."' },
  { icon: Clock, title: 'Reto Mindfulness 21D', nicho: 'Mindfulness & Bienestar', duration: '21 días', result: '94% finalización · 35% compró retiro premium', color: '#06b6d4', preview: '"Tu meditación de hoy es de 12 min. He notado que..."' },
  { icon: MessageCircle, title: 'Reto Inglés Conversacional', nicho: 'Educación & Idiomas', duration: '14 días', result: '91% finalización · 40% se inscribió al curso completo', color: '#25D366', preview: '"Let\'s practice! Based on your level, today we\'ll..."' },
];

function Showcase() {
  return (
    <section id="casos" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Ejemplos reales</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>Retos que ya están convirtiendo</h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[540px] mx-auto" style={{ lineHeight: 1.7 }}>Cada reto se adapta al nicho, la audiencia y el producto high-ticket del creador. Aquí algunos ejemplos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {retos.map((reto, i) => {
            const Icon = reto.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.08 }} className="group relative rounded-xl border border-brand-border bg-brand-surface/30 overflow-hidden hover:border-[#25D366]/25 transition-all duration-300">
                <div className="px-4 pt-4 pb-3">
                  <div className="rounded-lg bg-[#efeae2] p-3 border border-gray-200/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${reto.color}20` }}>
                        <Icon className="w-3 h-3" style={{ color: reto.color }} />
                      </div>
                      <span className="text-[0.6rem] text-gray-600" style={{ fontWeight: 600 }}>{reto.title}</span>
                    </div>
                    <div className="bg-white rounded-lg px-2.5 py-2 shadow-sm">
                      <p className="text-[0.65rem] text-gray-700 italic" style={{ lineHeight: 1.5 }}>{reto.preview}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[0.6rem] px-2 py-0.5 rounded-full border" style={{ color: reto.color, borderColor: `${reto.color}30`, backgroundColor: `${reto.color}10`, fontWeight: 600 }}>{reto.nicho}</span>
                    <span className="text-[0.6rem] px-2 py-0.5 rounded-full border border-brand-border bg-brand-surface-elevated text-brand-muted" style={{ fontWeight: 500 }}>{reto.duration}</span>
                  </div>
                  <h3 className="text-[0.9375rem] text-brand-text mb-1.5" style={{ fontWeight: 600 }}>{reto.title}</h3>
                  <p className="text-[0.75rem] text-[#25D366]" style={{ fontWeight: 500 }}>{reto.result}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <button onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-brand-border hover:border-[#25D366]/30 text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer bg-transparent hover:bg-brand-surface/50">
            Crear mi reto personalizado
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════ */

const howSteps = [
  { num: '01', icon: MessageCircle, title: 'Definimos tu reto', desc: 'Elegimos tema, duración (7, 14 o 21 días), estructura del contenido diario y la oferta high-ticket que vas a vender al final. Tú pones el conocimiento, nosotros la estrategia.' },
  { num: '02', icon: Brain, title: 'Entrenamos tu tutor IA', desc: 'La IA se entrena con tu método, tu estilo y tu voz. Se convierte en un clon de tu coaching — responde dudas, adapta el contenido al nivel de cada participante y sabe cuándo ofrecer tu programa premium.' },
  { num: '03', icon: Rocket, title: 'Lanzas y la IA hace el resto', desc: 'En 3 semanas tu reto está listo. Los participantes entran, la IA los guía 24/7, y tú solo ves el dashboard con métricas de finalización, engagement y conversiones a high-ticket.' },
];

function HowItWorks() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="como-funciona" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Proceso</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>De cero a tu reto en 3 semanas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-[1000px] mx-auto relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-[#25D366]/30 via-[#25D366]/20 to-[#25D366]/30" />
          {howSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.15 }} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-[#25D366]/8 border border-[#25D366]/15 flex items-center justify-center group-hover:bg-[#25D366]/15 group-hover:border-[#25D366]/30 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(37,211,102,0.15)]">
                    <Icon className="w-7 h-7 text-[#25D366]" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-[#25D366] to-[#34eb77] text-white text-[0.6875rem] flex items-center justify-center shadow-[0_0_15px_rgba(37,211,102,0.4)]" style={{ fontWeight: 700 }}>{step.num}</span>
                </div>
                <h3 className="text-[1.0625rem] text-brand-text mb-3" style={{ fontWeight: 600 }}>{step.title}</h3>
                <p className="text-[0.8125rem] text-brand-muted max-w-[280px]" style={{ lineHeight: 1.7 }}>{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="flex justify-center mt-14">
          <button onClick={() => scrollTo('formulario')} className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] active:scale-[0.98]" style={{ fontWeight: 600 }}>
            Empezar a construir mi reto
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   STACK ACCORDION
   ═══════════════════════════════════════════════════════════ */

const stackItems = [
  { icon: Brain, title: 'Tutor IA entrenado con tu método', desc: 'La IA aprende tu estilo de enseñanza, tu terminología y tu enfoque. Cada respuesta suena a ti — no a un chatbot genérico. Es como clonar tu coaching 1:1 para miles de personas simultáneamente.' },
  { icon: MessageCircle, title: 'Flujo conversacional por WhatsApp', desc: 'Diseñamos cada día del reto como una conversación natural. Contenido, ejercicios, reflexiones y check-ins que se sienten como hablar con un mentor, no como leer un módulo de curso.' },
  { icon: Sparkles, title: 'Hyper-personalización en tiempo real', desc: 'La IA adapta el contenido según las respuestas, el progreso y el nivel de cada participante. Si alguien va avanzado, sube la intensidad. Si alguien se atascó, ajusta el ritmo. Cada experiencia es única.' },
  { icon: Zap, title: 'Seguimiento y rachas automáticas', desc: 'Sistema de rachas diarias, recordatorios inteligentes y motivación contextual. Si un participante no responde, la IA le manda un nudge personalizado. La retención se cuida sola.' },
  { icon: Target, title: 'Funnel de conversión a high-ticket', desc: 'La IA detecta cuándo un participante está listo para tu oferta premium y la presenta de forma natural dentro de la conversación. No es un pitch — es la recomendación lógica basada en sus resultados.' },
  { icon: BarChart3, title: 'Dashboard de métricas en tiempo real', desc: 'Tasa de finalización, engagement por día, respuestas del tutor, conversiones a high-ticket, revenue y NPS. Todo en un panel visual que te permite optimizar cada cohort.' },
  { icon: Settings, title: 'Panel de administración y contenido', desc: 'Edita el contenido del reto, ajusta respuestas de la IA, programa cohorts y gestiona participantes. Todo sin código — tú tienes el control total de tu reto.' },
  { icon: Headphones, title: 'Soporte y optimización continua', desc: 'Acompañamiento post-lanzamiento: analizamos métricas, optimizamos el flujo conversacional, mejoramos las respuestas de la IA y aumentamos la conversión cohort tras cohort.' },
];

function StackAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Qué incluye</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>Todo lo que hace funcionar tu reto</h2>
          <p className="mt-4 text-[0.875rem] text-brand-muted max-w-[500px] mx-auto" style={{ lineHeight: 1.7 }}>Cada componente está diseñado para maximizar finalización, engagement y conversión a high-ticket.*</p>
        </div>

        <div className="max-w-[760px] mx-auto flex flex-col gap-2">
          {stackItems.map((item, i) => {
            const isOpen = openIndex === i;
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.4, delay: i * 0.04 }} className={`rounded-xl border transition-all duration-300 ${isOpen ? 'border-[#25D366]/25 bg-brand-surface/80 shadow-[0_0_20px_rgba(37,211,102,0.05)]' : 'border-brand-border bg-brand-surface/20 hover:bg-brand-surface/40'}`}>
                <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center gap-4 p-5 cursor-pointer text-left">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#25D366]/15 border border-[#25D366]/20' : 'bg-brand-surface-elevated'}`}>
                    <Icon className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#25D366]' : 'text-brand-muted'}`} />
                  </div>
                  <span className={`flex-1 text-[0.9375rem] transition-colors ${isOpen ? 'text-brand-text' : 'text-brand-text-secondary'}`} style={{ fontWeight: 500 }}>{item.title}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                      <div className="px-5 pb-5 pl-[4.5rem]">
                        <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.7 }}>{item.desc}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <p className="text-center mt-6 text-[0.6875rem] text-brand-muted/60 italic">* Los entregables se personalizan según tu nicho, audiencia y estrategia definida en el diagnóstico.</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOCIAL PROOF
   ═══════════════════════════════════════════════════════════ */

const proofMetrics = [
  { icon: Target, value: '92%', label: 'Tasa de finalización' },
  { icon: TrendingUp, value: '10–30%', label: 'Compra high-ticket post-reto' },
  { icon: Zap, value: '<20s', label: 'Tiempo de respuesta IA' },
  { icon: MessageCircle, value: '4.8x', label: 'Más engagement vs email' },
];

const testimonials = [
  { name: 'Creadora fitness, 120K', role: 'Instagram & YouTube', text: 'Tenía un curso de $197 con 4% de finalización. Lancé un reto de 21 días por WhatsApp y el 92% terminó. Lo más loco: el 38% compró mi programa de 12 semanas de $2,500.', rating: 5 },
  { name: 'Nutrióloga digital, 85K', role: 'TikTok & Instagram', text: 'Mis alumnas terminaban el curso y desaparecían. Con el reto, la IA les da seguimiento personalizado cada día. Ahora el 31% migra a mi mentoría grupal de $1,800.', rating: 5 },
  { name: 'Coach de negocios, 200K', role: 'YouTube & Podcast', text: 'El reto de 7 días me genera más clientes high-ticket que cualquier webinar que haya hecho. Y ni siquiera necesito estar presente — la IA hace todo el trabajo.', rating: 5 },
];

function TestimonialCard({ testimonial }: { testimonial: (typeof testimonials)[0] }) {
  return (
    <div className="flex flex-col p-6 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/50 transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
        ))}
      </div>
      <p className="text-[0.875rem] text-brand-text-secondary mb-5 flex-1" style={{ lineHeight: 1.7 }}>&ldquo;{testimonial.text}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#34eb77]/20 border border-[#25D366]/15 flex items-center justify-center">
          <span className="text-[0.6875rem] text-[#25D366]" style={{ fontWeight: 700 }}>{testimonial.name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-[0.8125rem] text-brand-text" style={{ fontWeight: 500 }}>{testimonial.name}</p>
          <p className="text-[0.6875rem] text-brand-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>Resultados reales</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>Creadores que dejaron de depender de cursos</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {proofMetrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex flex-col items-center p-6 md:p-8 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/60 hover:border-[#25D366]/15 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/15 transition-colors">
                  <Icon className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="text-[1.75rem] md:text-[2.5rem] text-brand-text" style={{ fontWeight: 800 }}>{metric.value}</span>
                <span className="text-[0.75rem] text-brand-muted mt-1 text-center" style={{ fontWeight: 500 }}>{metric.label}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="hidden md:grid grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </div>

        <div className="md:hidden">
          <TestimonialCard testimonial={testimonials[activeTestimonial]} />
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center hover:border-[#25D366]/30 hover:bg-brand-surface/50 transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-brand-muted" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeTestimonial ? 'bg-[#25D366] w-6' : 'bg-brand-surface-elevated hover:bg-brand-muted'}`} />
              ))}
            </div>
            <button onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)} className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center hover:border-[#25D366]/30 hover:bg-brand-surface/50 transition-all cursor-pointer">
              <ChevronRight className="w-4 h-4 text-brand-muted" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════ */

const faqs = [
  { q: '¿Qué es exactamente un reto por WhatsApp con IA?', a: 'Es un programa de 7, 14 o 21 días donde tus participantes reciben contenido diario, ejercicios y seguimiento personalizado a través de WhatsApp. Un tutor IA entrenado con tu método los guía, responde dudas, adapta el ritmo a su nivel y los motiva a completar cada día. Es como un curso — pero conversacional, personalizado y con 92% de finalización.' },
  { q: '¿Cómo funciona el tutor IA? ¿Suena robótico?', a: 'La IA se entrena específicamente con tu contenido, estilo de comunicación y personalidad. No es un chatbot genérico — es un clon de tu coaching que mantiene conversaciones naturales, da feedback personalizado según las respuestas de cada participante y adapta la intensidad del reto al nivel individual. Tus participantes sienten que hablan con un mentor real.' },
  { q: '¿Puedo seguir vendiendo mis cursos?', a: '¡Absolutamente! De hecho, el reto es el complemento perfecto. Úsalo como puerta de entrada a bajo costo, genera resultados rápidos y confianza, y después ofrece tu curso o programa high-ticket como la siguiente evolución. Los creadores que combinan reto + high-ticket ven un 10%–30% de conversión post-reto.' },
  { q: '¿Cuánto cuesta para mis participantes?', a: 'Tú defines el precio. La mayoría de creadores cobra entre $27 y $97 por reto como puerta de entrada. El objetivo no es ganar dinero con el reto — es generar confianza, resultados y leads ultra-calientes para tu oferta premium ($1,000–$10,000+).' },
  { q: '¿Cuánto tiempo toma tener mi reto listo?', a: '3 semanas desde el inicio. En la primera semana definimos la estrategia y estructura. En la segunda entrenamos la IA con tu método. En la tercera probamos, ajustamos y lanzamos. Mientras tu competencia sigue grabando módulos, tú ya estás vendiendo.' },
  { q: '¿Tengo que estar disponible durante el reto?', a: 'No. La IA maneja todo: contenido diario, respuestas a dudas, seguimiento, motivación y hasta la presentación de tu oferta high-ticket. Tú solo revisas el dashboard de métricas cuando quieras. Es 100% piloto automático.' },
  { q: '¿Funciona para mi nicho?', a: 'Si puedes enseñar algo en 7-21 días con ejercicios prácticos, funciona. Hemos construido retos para fitness, nutrición, finanzas, coaching, mindfulness, idiomas, productividad y más. Lo importante es que tengas un método y una audiencia dispuesta a actuar.' },
  { q: '¿Cuánto cuesta el desarrollo del reto?', a: 'Los proyectos de reto con IA comienzan desde USD $7,000. Incluye estrategia, diseño del flujo, entrenamiento de la IA, dashboard de métricas, funnel de high-ticket y soporte post-lanzamiento. En la reunión de diagnóstico definimos el alcance exacto.' },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#25D366]" style={{ fontWeight: 600 }}>FAQ</span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>Preguntas frecuentes</h2>
        </div>

        <div className="max-w-[760px] mx-auto flex flex-col gap-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.4, delay: i * 0.05 }} className={`rounded-xl border transition-all duration-300 ${isOpen ? 'border-[#25D366]/25 bg-brand-surface/80 shadow-[0_0_20px_rgba(37,211,102,0.05)]' : 'border-brand-border bg-brand-surface/20 hover:bg-brand-surface/40'}`}>
                <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center gap-4 p-5 cursor-pointer text-left">
                  <span className={`flex-1 text-[0.9375rem] transition-colors ${isOpen ? 'text-brand-text' : 'text-brand-text-secondary'}`} style={{ fontWeight: 500 }}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-muted flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.8 }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCARCITY
   ═══════════════════════════════════════════════════════════ */

function Scarcity() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-16 md:py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#25D366]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#25D366]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#25D366]/[0.02] via-[#25D366]/[0.04] to-[#25D366]/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#25D366]/20 bg-[#25D366]/8">
            <Shield className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="text-[0.75rem] text-[#25D366]" style={{ fontWeight: 500 }}>Cupos limitados por cohort</span>
          </div>
          <h2 className="text-[1.5rem] md:text-[2rem] text-brand-text tracking-tight max-w-[640px]" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Mientras tú piensas en lanzar tu próximo curso,<br className="hidden md:block" />tu competencia ya está vendiendo high-ticket con retos
          </h2>
          <p className="text-[0.9375rem] text-brand-text-secondary max-w-[500px]" style={{ lineHeight: 1.7 }}>
            Solo tomamos 5 proyectos de reto al mes para garantizar que cada tutor IA se entrene con la atención que merece. 3 semanas y tu reto está generando leads.
          </p>
          <button onClick={() => scrollTo('formulario')} className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white transition-all cursor-pointer shadow-[0_0_40px_rgba(37,211,102,0.35)] hover:shadow-[0_0_60px_rgba(37,211,102,0.5)] active:scale-[0.98]" style={{ fontWeight: 600, fontSize: '1.0625rem' }}>
            Lanzar mi reto ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="relative border-t border-brand-border bg-brand-surface/20">
      <div className="mx-auto max-w-[1240px] px-4 md:px-20 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image src={logoHeader} alt="Afluence" height={32} className="w-auto" />
            </div>
            <p className="text-[0.75rem] text-brand-muted max-w-[280px]" style={{ lineHeight: 1.7 }}>Retos por WhatsApp con tutor IA para creadores e infoproductores que quieren vender high-ticket.</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8">
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">Privacidad</a>
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">Términos</a>
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            {[{ label: 'IG' }, { label: 'TW' }, { label: 'LI' }, { label: 'YT' }].map((social) => (
              <a key={social.label} href="#" className="w-9 h-9 rounded-lg border border-brand-border bg-brand-surface/50 flex items-center justify-center text-[0.6875rem] text-brand-muted hover:text-brand-accent hover:border-brand-accent/25 hover:bg-brand-accent/5 transition-all" style={{ fontWeight: 600 }}>{social.label}</a>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.6875rem] text-brand-muted/60">&copy; 2026 Afluence. Todos los derechos reservados.</p>
          <p className="text-[0.6875rem] text-brand-muted/60">Hecho con cuidado para creadores que quieren resultados, no solo contenido.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */

export function LandingClient() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <BookingSection />
        <PainPoints />
        <Services />
        <RetoVsCurso />
        <HighTicketFunnel />
        <Showcase />
        <HowItWorks />
        <StackAccordion />
        <SocialProof />
        <FAQ />
        <Scarcity />
      </main>
      <Footer />
    </div>
  );
}
