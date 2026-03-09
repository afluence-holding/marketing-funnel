import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    q: "¿Cuánto cuesta el servicio?",
    a: "Cada proyecto es personalizado, por lo que el precio varía según la complejidad, las funcionalidades y los entregables. En la reunión inicial definimos el alcance y te damos una cotización transparente sin compromiso.",
  },
  {
    q: "¿Cuánto tiempo toma el desarrollo?",
    a: "Dependiendo del alcance, un MVP puede estar listo en 4–8 semanas. Proyectos más complejos (app + IA + plataforma completa) pueden tomar 8–16 semanas. Te damos un timeline claro desde el día 1.",
  },
  {
    q: "¿Soy dueño del código y la plataforma?",
    a: "Sí. Todo el código fuente, diseños y activos son de tu propiedad al finalizar el proyecto. Tienes control total sobre tu ecosistema digital.",
  },
  {
    q: "¿Qué pasa después del lanzamiento?",
    a: "Ofrecemos planes de soporte y optimización post-lanzamiento. Incluyen mantenimiento técnico, actualizaciones, monitoreo y acompañamiento estratégico para seguir escalando.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Nos encargamos de todo lo técnico. Solo necesitas conocer a tu audiencia y estar dispuesto(a) a colaborar en la definición de la estrategia. El panel de administración que entregamos es intuitivo y no requiere código.",
  },
  {
    q: "¿Qué integraciones soportan?",
    a: "Trabajamos con Stripe, PayPal, Conekta, MercadoPago, WhatsApp Business API, ActiveCampaign, Mailchimp, Google Analytics, Meta Pixel, Zapier y muchas más. Si necesitas algo específico, lo evaluamos.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />

      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            FAQ
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Preguntas frecuentes
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-[760px] mx-auto flex flex-col gap-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
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
                  <span className={`flex-1 text-[0.9375rem] transition-colors ${
                    isOpen ? "text-brand-text" : "text-brand-text-secondary"
                  }`} style={{ fontWeight: 500 }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-muted flex-shrink-0 transition-transform duration-300 ${
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
                      <div className="px-5 pb-5">
                        <p className="text-[0.8125rem] text-brand-muted" style={{ lineHeight: 1.8 }}>
                          {faq.a}
                        </p>
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