import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, TrendingUp, Users, Zap, Award } from "lucide-react";
import { motion } from "motion/react";

const metrics = [
  { icon: TrendingUp, value: "23M+", label: "Followers entre nuestros creadores" },
  { icon: Users, value: "9", label: "Creadores activos" },
  { icon: Zap, value: "100", label: "NPS" },
  { icon: Award, value: "30+", label: "Productos lanzados" },
];

const testimonials = [
  {
    name: "Creador fitness, 120K",
    role: "Instagram & YouTube",
    text: "Pasé de vender por DM a tener una app con +2,000 miembros activos. El sistema se paga solo cada mes.",
    rating: 5,
  },
  {
    name: "Nutrióloga digital, 85K",
    role: "TikTok & Instagram",
    text: "El bot de WhatsApp me liberó 4 horas diarias. Ahora mis ventas están automatizadas y mis clientes más satisfechos.",
    rating: 5,
  },
  {
    name: "Coach de negocios, 200K",
    role: "YouTube & Podcast",
    text: "Lancé mi programa high-ticket con checkout optimizado. En el primer mes superé mi meta de inscripción en un 180%.",
    rating: 5,
  },
];

export function SocialProof() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />

      <div className="mx-auto max-w-[1240px] px-4 md:px-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent" style={{ fontWeight: 600 }}>
            Resultados
          </span>
          <h2 className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight" style={{ fontWeight: 700, lineHeight: 1.15 }}>
            Prueba social
          </h2>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center p-6 md:p-8 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/60 hover:border-brand-accent/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-brand-accent/15 transition-colors">
                  <Icon className="w-5 h-5 text-brand-accent" />
                </div>
                <span className="text-[1.75rem] md:text-[2.5rem] text-brand-text" style={{ fontWeight: 800 }}>
                  {metric.value}
                </span>
                <span className="text-[0.75rem] text-brand-muted mt-1 text-center" style={{ fontWeight: 500 }}>
                  {metric.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials — Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <TestimonialCard testimonial={testimonials[activeTestimonial]} />
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center hover:border-brand-accent/30 hover:bg-brand-surface/50 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-brand-muted" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === activeTestimonial ? "bg-brand-accent w-6" : "bg-brand-surface-elevated hover:bg-brand-muted"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center hover:border-brand-accent/30 hover:bg-brand-surface/50 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-brand-muted" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex flex-col p-6 rounded-xl border border-brand-border bg-brand-surface/30 hover:bg-brand-surface/50 transition-all duration-300">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
        ))}
      </div>
      {/* Quote */}
      <p className="text-[0.875rem] text-brand-text-secondary mb-5 flex-1" style={{ lineHeight: 1.7 }}>
        &ldquo;{testimonial.text}&rdquo;
      </p>
      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent/20 to-[#a78bfa]/20 border border-brand-accent/15 flex items-center justify-center">
          <span className="text-[0.6875rem] text-brand-accent" style={{ fontWeight: 700 }}>
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-[0.8125rem] text-brand-text" style={{ fontWeight: 500 }}>
            {testimonial.name}
          </p>
          <p className="text-[0.6875rem] text-brand-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}