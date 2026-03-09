import { PhoneMindfulness } from "./PhoneMindfulness";
import { WhatsAppChatMockup } from "./WhatsAppChatMockup";
import { WhatsAppCallMockup } from "./WhatsAppCallMockup";
import { PhoneCheckout } from "./PhoneCheckout";
import { WhatsAppRetoMockup } from "./WhatsAppRetoMockup";
import { PhoneDashboard } from "./PhoneDashboard";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const cases = [
  {
    title: "App de membresía",
    tag: "App Móvil",
    result: "+340% retención",
    image: "https://images.unsplash.com/photo-1738563710982-6ebe69cd5b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBtb2NrdXAlMjBkYXJrfGVufDF8fHx8MTc3MTQ2MTg4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Agente de WhatsApp",
    tag: "Automatización",
    result: "+85% respuestas",
    image: "https://images.unsplash.com/photo-1725798451600-ed47670340d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGF0c2FwcCUyMGNoYXRib3QlMjBtZXNzYWdpbmd8ZW58MXx8fHwxNzcxNDYxODgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Agentes de Voz IA",
    tag: "Agentes de Voz",
    result: "+95% llamadas atendidas",
    image: "https://images.unsplash.com/photo-1620245446020-879dc5cf2414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHZvaWNlJTIwYXNzaXN0YW50JTIwbWljcm9waG9uZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcxNjI5ODg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Reto con IA por WhatsApp",
    tag: "Retos WhatsApp IA",
    result: "92% tasa de finalización",
    image: "https://images.unsplash.com/photo-1770970716469-4b32abc0a577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwaW5mbHVlbmNlciUyMHdvcmtvdXR8ZW58MXx8fHwxNzcxMzgxOTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Checkout + Upsells",
    tag: "Plataforma Web",
    result: "+67% ticket prom.",
    image: "https://images.unsplash.com/photo-1646737554389-49329965ef01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwYXBwJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc3MTQ2MDc0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Dashboard Analytics",
    tag: "Plataforma Web",
    result: "Decisiones data-driven",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzJTIwZGFya3xlbnwxfHx8fDE3NzE0NjE4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function Showcase() {
  return (
    <section id="casos" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            Portfolio
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Casos & Productos
          </h2>
          <p className="mt-4 text-[1rem] text-brand-text-secondary max-w-[540px] mx-auto" style={{ lineHeight: 1.7 }}>
            Soluciones reales construidas para creadores que monetizan su audiencia.
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {cases.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl border border-brand-border bg-brand-surface/30 overflow-hidden hover:border-brand-accent/25 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden relative">
                {i === 0 ? (
                  <PhoneMindfulness />
                ) : i === 1 ? (
                  <WhatsAppChatMockup />
                ) : i === 2 ? (
                  <WhatsAppCallMockup />
                ) : i === 3 ? (
                  <WhatsAppRetoMockup />
                ) : i === 4 ? (
                  <PhoneCheckout />
                ) : i === 5 ? (
                  <PhoneDashboard />
                ) : (
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-90"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent opacity-60" />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.6875rem] px-2.5 py-1 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/15" style={{ fontWeight: 500 }}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-[1rem] text-brand-text mb-1" style={{ fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="text-[0.8125rem] text-brand-success" style={{ fontWeight: 500 }}>
                  {item.result}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-brand-border hover:border-brand-accent/30 text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer bg-transparent hover:bg-brand-surface/50"
          >
            Ver todos los casos
          </button>
        </div>
      </div>
    </section>
  );
}