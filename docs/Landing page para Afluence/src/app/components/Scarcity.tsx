import { ArrowRight, Shield } from "lucide-react";
import { motion } from "motion/react";

export function Scarcity() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-16 md:py-20">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/[0.02] via-brand-accent/[0.04] to-brand-accent/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/8">
            <Shield className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-[0.75rem] text-brand-accent" style={{ fontWeight: 500 }}>
              Disponibilidad limitada
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-[1.5rem] md:text-[2rem] text-brand-text tracking-tight max-w-[600px]" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Cupos semanales limitados para asegurar calidad
          </h2>

          <p className="text-[0.9375rem] text-brand-text-secondary max-w-[480px]" style={{ lineHeight: 1.7 }}>
            Trabajamos con un número reducido de creadores al mismo tiempo para garantizar atención
            personalizada y resultados excepcionales.
          </p>

          {/* CTA */}
          <button
            onClick={() => scrollTo("formulario")}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white transition-all cursor-pointer shadow-[0_0_40px_rgba(108,92,231,0.35)] hover:shadow-[0_0_60px_rgba(108,92,231,0.5)] active:scale-[0.98]"
            style={{ fontWeight: 600, fontSize: "1.0625rem" }}
          >
            Agendar reunión
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}