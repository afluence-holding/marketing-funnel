import { Smartphone, Bot, GraduationCap, LayoutDashboard, AudioLines, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    icon: Smartphone,
    title: "Apps para creadores",
    desc: "Aplicaciones móviles y web personalizadas para monetizar tu audiencia con membresías, contenido exclusivo y comunidad.",
  },
  {
    icon: Bot,
    title: "Automatización con IA",
    desc: "Agentes inteligentes para ventas, soporte, operaciones y contenido. WhatsApp, Instagram y más, sin perder leads.",
  },
  {
    icon: AudioLines,
    title: "Agentes de voz",
    desc: "Asistentes de voz con IA que atienden llamadas, agendan citas, califican leads y dan soporte 24/7 en tiempo real.",
  },
  {
    icon: MessageCircle,
    title: "Retos con IA en WhatsApp",
    desc: "Retos de 7, 14 o 21 días en piloto automático. La IA guía, motiva y convierte participantes en clientes premium.",
    accent: true,
  },
  {
    icon: GraduationCap,
    title: "Productos digitales",
    desc: "Cursos, membresías y programas high-ticket. Diseñados para escalar tus ingresos recurrentes.",
  },
  {
    icon: LayoutDashboard,
    title: "Plataformas web",
    desc: "Análisis de datos, CRM, comunidad privada y analytics en tiempo real. Todo integrado en un solo lugar.",
  },
];

export function Services() {
  return (
    <section id="servicios" className="relative py-20 md:py-28">
      {/* Subtle bg dividers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            Soluciones
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Lo resolvemos con...
          </h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[540px] mx-auto" style={{ lineHeight: 1.7 }}>
            Un ecosistema completo de herramientas construidas específicamente para creadores de contenido.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isAccent = "accent" in service && service.accent;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative flex flex-col p-6 md:p-7 rounded-xl border transition-all duration-300 ${
                  isAccent
                    ? "border-[#25D366]/25 bg-[#25D366]/5 hover:bg-[#25D366]/10 hover:border-[#25D366]/40"
                    : "border-brand-border bg-brand-surface/30 hover:bg-brand-surface/70 hover:border-brand-accent/25"
                }`}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${
                  isAccent ? "from-[#25D366]/8" : "from-brand-accent/5"
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                    isAccent
                      ? "bg-[#25D366]/10 border border-[#25D366]/15 group-hover:bg-[#25D366]/20 group-hover:border-[#25D366]/25"
                      : "bg-brand-accent/10 border border-brand-accent/10 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/20"
                  }`}>
                    <Icon className={`w-5 h-5 ${isAccent ? "text-[#25D366]" : "text-brand-accent"}`} />
                  </div>
                  {isAccent && (
                    <span className="absolute top-0 right-0 text-[0.6rem] px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20" style={{ fontWeight: 600 }}>
                      NUEVO
                    </span>
                  )}
                  <h3 className="text-[1.0625rem] text-brand-text mb-2" style={{ fontWeight: 600 }}>
                    {service.title}
                  </h3>
                  <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.7 }}>
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}