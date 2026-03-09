import { X, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const pains = [
  "Tienes audiencia, pero ingresos impredecibles",
  "DMs saturados y pierdes ventas",
  "Lanzas sin sistema y se cae el proceso",
  "Los clientes se quejan de tu producto y te piden reembolso",
  "LTV bajo: tus clientes compran una vez y no regresan",
  "Lanzamientos esporádicos y riesgosos que dependen de la suerte",
];

export function PainPoints() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            El problema
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            ¿Has pasado por esto?
          </h2>
        </div>

        {/* Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-[900px] mx-auto">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 md:p-6 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/70 hover:border-brand-error/20 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-error/10 border border-brand-error/20 flex items-center justify-center mt-0.5 group-hover:bg-brand-error/15 transition-colors">
                <X className="w-4 h-4 text-brand-error" />
              </div>
              <p className="text-[0.9375rem] md:text-[1.0625rem] text-brand-text-secondary group-hover:text-brand-text transition-colors" style={{ lineHeight: 1.6 }}>
                {pain}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <button
            onClick={() => scrollTo("formulario")}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(108,92,231,0.3)] hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] active:scale-[0.98]"
            style={{ fontWeight: 600 }}
          >
            Resolver esto ahora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}