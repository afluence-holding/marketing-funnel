import { useState, useEffect } from "react";
import {
  MessageCircle,
  Zap,
  Users,
  TrendingUp,
  CheckCheck,
  Bot,
  ArrowRight,
  Trophy,
  Flame,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ── Chat messages simulating the AI WhatsApp challenge ── */
const chatMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Buenos dias! Dia 7 de tu Reto 21 dias. Hoy toca: 30 min de cardio HIIT + 2L de agua. Estas lista?",
    time: "7:00 AM",
    avatar: "bot",
  },
  {
    id: 2,
    sender: "user",
    text: "Siiii! Ya estoy calentando",
    time: "7:02 AM",
    avatar: "user",
  },
  {
    id: 3,
    sender: "bot",
    text: "Excelente! Cuando termines, mandame foto de tu workout. Tu racha es de 7 dias seguidos, vas increible!",
    time: "7:02 AM",
    avatar: "bot",
  },
  {
    id: 4,
    sender: "user",
    text: "[Foto del workout]  Listo! Uff quede muerta",
    time: "7:48 AM",
    avatar: "user",
  },
  {
    id: 5,
    sender: "bot",
    text: "BRUTAL! Dia 7 completado. Tu progreso: 33% del reto. Tip de nutricion: post-workout come proteina en los primeros 30 min. Quieres la receta de smoothie proteico?",
    time: "7:49 AM",
    avatar: "bot",
  },
  {
    id: 6,
    sender: "user",
    text: "Siii porfaa!",
    time: "7:50 AM",
    avatar: "user",
  },
];

const features = [
  {
    icon: Bot,
    title: "IA conversacional 24/7",
    desc: "El bot guia, motiva y responde dudas en tiempo real. Cada participante recibe atencion personalizada.",
  },
  {
    icon: Flame,
    title: "Rachas y gamificacion",
    desc: "Sistema de rachas, puntos y rankings que mantienen a tus alumnos comprometidos todo el reto.",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento automatico",
    desc: "Tracking de progreso, recordatorios inteligentes y reportes diarios sin que tu hagas nada.",
  },
  {
    icon: Users,
    title: "Escala sin limites",
    desc: "Atiende 100 o 10,000 participantes con la misma calidad. Sin contratar equipo extra.",
  },
];

const stats = [
  { value: "95%", label: "NPS", hasBar: true, barPercent: 95 },
  { value: "4.8x", label: "Más engagement vs email", hasBar: false, barPercent: 0 },
  { value: "33%", label: "Compra el high-ticket post reto", hasBar: true, barPercent: 33 },
  { value: "<20s", label: "Tiempo de respuesta IA", hasBar: false, barPercent: 0 },
];

export function WhatsAppChallenges() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    if (visibleMessages >= chatMessages.length) return;
    const timer = setTimeout(
      () => setVisibleMessages((p) => p + 1),
      visibleMessages === 0 ? 400 : 900
    );
    return () => clearTimeout(timer);
  }, [isInView, visibleMessages]);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[#25D366]/5 blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[130px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#25D366]/20 bg-[#25D366]/5 backdrop-blur-sm mb-5">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span
                className="text-[0.75rem] text-[#25D366]"
                style={{ fontWeight: 500 }}
              >
                Nuevo
              </span>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight"
            style={{ fontWeight: 700, lineHeight: 1.15 }}
          >
            Retos con IA en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-[#128C7E]">
              WhatsApp
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-[1rem] text-brand-text-secondary max-w-[580px] mx-auto"
            style={{ lineHeight: 1.7 }}
          >
            Tu reto de 7, 14 o 21 dias corre en piloto automatico. La IA guia a
            cada participante, trackea su progreso y los convierte en clientes de
            tu programa premium.
          </motion.p>
        </div>

        {/* Main content: Chat mockup + Features */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* WhatsApp Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            onViewportEnter={() => setIsInView(true)}
            className="w-full lg:w-[45%] flex-shrink-0"
          >
            <div className="relative mx-auto max-w-[380px] lg:max-w-none">
              {/* Phone glow */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-b from-[#25D366]/15 via-[#25D366]/5 to-transparent blur-2xl opacity-50" />

              {/* Phone frame */}
              <div className="relative rounded-2xl border border-[#e0e0e0] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                {/* WhatsApp header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#008069] border-b border-[#007a63]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[0.8125rem] text-white truncate"
                      style={{ fontWeight: 600 }}
                    >
                      Reto 21 Dias - Coach IA
                    </p>
                    <p className="text-[0.6875rem] text-white/70">en linea</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#fbbf24]" />
                    <span
                      className="text-[0.6875rem] text-[#fbbf24]"
                      style={{ fontWeight: 600 }}
                    >
                      Dia 7
                    </span>
                  </div>
                </div>

                {/* Chat background pattern */}
                <div
                  className="relative px-3 py-4 min-h-[420px] flex flex-col gap-1.5 bg-[#efeae2]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                >
                  {/* Date divider */}
                  <div className="flex justify-center mb-2">
                    <span className="px-3 py-1 rounded-lg bg-[#e1f2fb] text-[0.6875rem] text-[#54656f]">
                      HOY
                    </span>
                  </div>

                  <AnimatePresence>
                    {chatMessages.slice(0, visibleMessages).map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            msg.sender === "user"
                              ? "bg-[#d9fdd3] rounded-tr-none"
                              : "bg-white rounded-tl-none"
                          }`}
                        >
                          <p
                            className="text-[0.8125rem] text-[#111b21]"
                            style={{ lineHeight: 1.5 }}
                          >
                            {msg.text}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-[0.625rem] text-[#667781]">
                              {msg.time}
                            </span>
                            {msg.sender === "user" && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {visibleMessages > 0 &&
                    visibleMessages < chatMessages.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-lg rounded-tl-none px-4 py-3">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-[#667781]"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: 0,
                              }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-[#667781]"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: 0.2,
                              }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-[#667781]"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>

                {/* Progress bar at bottom */}
                <div className="px-4 py-3 bg-[#f0f2f5] border-t border-[#e0e0e0]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[0.6875rem] text-[#54656f]"
                      style={{ fontWeight: 500 }}
                    >
                      Progreso del reto
                    </span>
                    <span
                      className="text-[0.6875rem] text-[#25D366]"
                      style={{ fontWeight: 600 }}
                    >
                      33%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#d1d7db] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E]"
                      initial={{ width: 0 }}
                      whileInView={{ width: "33%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#f97316]" />
                      <span className="text-[0.625rem] text-[#54656f]">
                        Racha: 7 dias
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#fbbf24]" />
                      <span className="text-[0.625rem] text-[#54656f]">
                        1,240 pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side: Features + Stats */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group p-5 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/60 hover:border-[#25D366]/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 border border-[#25D366]/10 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/20 transition-all">
                      <Icon className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <h4
                      className="text-[0.9375rem] text-brand-text mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      {feat.title}
                    </h4>
                    <p
                      className="text-[0.8125rem] text-brand-muted"
                      style={{ lineHeight: 1.65 }}
                    >
                      {feat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-brand-border/50 bg-[#111318]/80"
                >
                  <p
                    className="text-[1.25rem] md:text-[1.5rem] text-[#25D366]"
                    style={{ fontWeight: 700 }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[0.6875rem] text-brand-muted mt-1"
                    style={{ fontWeight: 400, lineHeight: 1.4 }}
                  >
                    {stat.label}
                  </p>
                  {stat.hasBar && (
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-2.5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.barPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button
                onClick={() =>
                  document
                    .getElementById("formulario")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#22c55e] text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_50px_rgba(37,211,102,0.5)] active:scale-[0.98]"
                style={{ fontWeight: 600 }}
              >
                <MessageCircle className="w-4 h-4" />
                Quiero mi reto
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p
                className="text-[0.75rem] text-brand-muted max-w-[260px] self-center sm:self-auto"
                style={{ lineHeight: 1.6 }}
              >
                Lanzamos tu reto en 3 semanas. Sin equipo tecnico de tu parte.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}