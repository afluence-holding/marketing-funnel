import { useState } from "react";
import { ChevronDown, Smartphone, Bot, ShoppingCart, Plug, Settings, BarChart3, Headphones, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const stackItems = [
  {
    icon: Smartphone,
    title: "App iOS / Android",
    desc: "Aplicación nativa o híbrida con tu marca. Incluye notificaciones push, contenido exclusivo, comunidad y pagos integrados.",
  },
  {
    icon: Bot,
    title: "IA WhatsApp & Chatbots",
    desc: "Bot conversacional inteligente para atención, ventas y seguimiento automatizado. Responde 24/7 sin perder oportunidades.",
  },
  {
    icon: ShoppingCart,
    title: "Checkout Optimizado",
    desc: "Página de pago con upsells, downsells y order bumps. Acepta tarjetas, OXXO, transferencia y más métodos LATAM.",
  },
  {
    icon: Plug,
    title: "Integraciones",
    desc: "Conectamos con tus herramientas: Stripe, PayPal, Mailchimp, ActiveCampaign, Zapier, Google Analytics y más.",
  },
  {
    icon: Settings,
    title: "Panel de Administración",
    desc: "Dashboard para gestionar usuarios, contenido, productos, pagos y métricas clave. Sin necesidad de código.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Métricas de negocio en tiempo real: conversiones, retención, revenue, LTV y funnels de venta completos.",
  },
  {
    icon: Headphones,
    title: "Soporte Post-Lanzamiento",
    desc: "Acompañamiento técnico continuo, actualizaciones, monitoreo y resolución de incidencias. Tranquilidad total.",
  },
  {
    icon: Globe,
    title: "Plataforma Web Completa",
    desc: "Landing pages, área de miembros, blog y más. Diseño responsive, SEO optimizado y velocidad de carga superior.",
  },
];

export function StackAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />

      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            Tecnología
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Stack & Entregables
          </h2>
          <p className="mt-4 text-[0.875rem] text-brand-muted max-w-[480px] mx-auto" style={{ lineHeight: 1.7 }}>
            Todo lo que incluye tu ecosistema digital. Cada entregable es personalizado según tu estrategia.*
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-[760px] mx-auto flex flex-col gap-2">
          {stackItems.map((item, i) => {
            const isOpen = openIndex === i;
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? "border-brand-accent/25 bg-brand-surface/80 shadow-[0_0_20px_rgba(108,92,231,0.05)]"
                    : "border-brand-border bg-brand-surface/20 hover:bg-brand-surface/40"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 p-5 cursor-pointer text-left"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen ? "bg-brand-accent/15 border border-brand-accent/20" : "bg-brand-surface-elevated"
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors ${isOpen ? "text-brand-accent" : "text-brand-muted"}`} />
                  </div>
                  <span className={`flex-1 text-[0.9375rem] transition-colors ${
                    isOpen ? "text-brand-text" : "text-brand-text-secondary"
                  }`} style={{ fontWeight: 500 }}>
                    {item.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-[4.5rem]">
                        <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.7 }}>
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center mt-6 text-[0.6875rem] text-brand-muted/60 italic">
          * Los entregables varían según el plan y la estrategia definida en el diagnóstico. No se garantizan resultados específicos.
        </p>
      </div>
    </section>
  );
}
