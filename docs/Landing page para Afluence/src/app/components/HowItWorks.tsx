import { Search, Wrench, Rocket, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Diagnóstico + Estrategia",
    desc: "Analizamos tu audiencia, contenido y modelo actual. Diseñamos una estrategia de monetización personalizada con objetivos claros.",
  },
  {
    num: "02",
    icon: Wrench,
    title: "Construcción",
    desc: "Desarrollamos tu app, automatizaciones con IA y plataforma web. Todo conectado, optimizado y listo para escalar.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Lanzamiento + Optimización",
    desc: "Lanzamos con tracking completo. Iteramos con datos reales: CRO, A/B testing y optimización continua de conversión.",
  },
];

export function HowItWorks() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="como-funciona" className="relative py-20 md:py-28">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />

      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            Proceso
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Cómo funciona
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-[1000px] mx-auto relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-brand-accent/30 via-brand-accent/20 to-brand-accent/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-brand-accent/8 border border-brand-accent/15 flex items-center justify-center group-hover:bg-brand-accent/15 group-hover:border-brand-accent/30 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(108,92,231,0.15)]">
                    <Icon className="w-7 h-7 text-brand-accent" />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-[#a78bfa] text-white text-[0.6875rem] flex items-center justify-center shadow-[0_0_15px_rgba(108,92,231,0.4)]"
                    style={{ fontWeight: 700 }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-[1.0625rem] text-brand-text mb-3" style={{ fontWeight: 600 }}>
                  {step.title}
                </h3>
                <p className="text-[0.8125rem] text-brand-muted max-w-[280px]" style={{ lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-14"
        >
          <button
            onClick={() => scrollTo("formulario")}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(108,92,231,0.3)] hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] active:scale-[0.98]"
            style={{ fontWeight: 600 }}
          >
            Empezar mi diagnóstico
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
