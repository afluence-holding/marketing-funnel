import { Play, ArrowRight, Users } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative pt-[72px] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#a78bfa]/5 blur-[130px]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-20 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-6 md:gap-8 text-center lg:text-left">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[2.25rem] md:text-[3.25rem] lg:text-[3.75rem] tracking-tight text-brand-text"
              style={{ fontWeight: 800, lineHeight: 1.08 }}
            >
              Convierte tu audiencia en ingresos con{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-[#a78bfa] to-brand-accent">
                Apps + IA
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[1rem] md:text-[1.125rem] text-brand-text-secondary max-w-[540px] mx-auto lg:mx-0"
              style={{ lineHeight: 1.7 }}
            >
              Construimos tu máquina de monetización y casos de éxito: app,
              automatización con IA, productos digitales y plataforma web.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => scrollTo("formulario")}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white transition-all cursor-pointer shadow-[0_0_30px_rgba(108,92,231,0.4)] hover:shadow-[0_0_50px_rgba(108,92,231,0.6)] active:scale-[0.98]"
                style={{ fontWeight: 600 }}
              >
                Agendar reunión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("casos")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-border hover:border-brand-border-hover text-brand-text-secondary hover:text-brand-text transition-all cursor-pointer bg-transparent hover:bg-brand-surface/50"
              >
                Ver casos
              </button>
            </motion.div>
          </div>

          {/* Right - Video Mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 max-w-[560px] w-full"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-brand-accent/20 via-[#a78bfa]/15 to-brand-accent/20 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              
              {/* Video container */}
              <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-brand-surface">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1519844763943-31a98097e1b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW50JTIwY3JlYXRvciUyMHN0dWRpbyUyMGRhcmt8ZW58MXx8fHwxNzcxNDYxODgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Creator Studio"
                    className="w-full h-full object-cover opacity-60"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-accent/90 hover:bg-brand-accent flex items-center justify-center transition-all cursor-pointer shadow-[0_0_50px_rgba(108,92,231,0.5)] hover:scale-110 active:scale-95">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </button>
                  </div>
                  {/* Overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-brand-bg/20" />
                </div>
                {/* Bottom bar */}
                <div className="px-4 py-3 bg-brand-surface/90 backdrop-blur-lg border-t border-brand-border flex items-center justify-between">
                  <span className="text-[0.75rem] text-brand-muted">Ver cómo funciona</span>
                  <span className="text-[0.75rem] text-brand-accent" style={{ fontWeight: 500 }}>2:45</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Proof Logos — full width below hero row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col gap-3 mt-16 text-center lg:text-left"
        >
          <p className="text-[0.8125rem] text-brand-muted uppercase tracking-[0.25em]" style={{ fontWeight: 600 }}>
            Partners oficiales de
          </p>
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center lg:justify-start gap-x-12 gap-y-4 mt-2">
            {/* Meta Business */}
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="36" height="22" viewBox="0 0 100 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.4 0C12.3 0 7.7 5.4 4.6 10.8C1.5 16.2 0 21 0 24.3C0 29 3 32 7.2 32C11.8 32 15 28.3 19.6 20L22.2 15.4C25.6 9.5 28.3 5.7 32.4 3.6C34.2 2.7 36.2 2.2 38.4 2.2C45.2 2.2 50.8 7.8 54 14C55.8 17.6 56.8 21.5 56.8 24.8C56.8 28.8 55 32 51 32C48.4 32 45.8 30.6 43 27.6C39.6 24 36.6 18.6 34.2 13L33.4 14.4C30 20.4 27 26.4 21.4 29.6C19.2 30.8 17 31.4 14.8 31.4C6.6 31.4 0 24.8 0 18.4" fillOpacity="0.85"/>
                <path d="M62.4 0C56.3 0 51.7 5.4 48.6 10.8L50.2 13.8C52 10 54.2 6.6 57.2 4.4C59 3.2 61 2.4 63.2 2.4C67 2.4 70 4.6 72.4 8.2C74.8 11.8 76.4 16.8 76.4 21.6C76.4 26.6 74.4 29.6 71 29.6C67.2 29.6 63.4 24.6 60 17L57.6 12.4C54.4 6.6 51.4 3 47.6 1.2L48.6 0C48.6 0 48.6 0 48.6 0C51 5 54 10 57 15.4L59.6 20.2C63.4 27.4 67 32 72.2 32C79.4 32 82 27 82 22C82 17 80.2 11.4 77 7C73.8 2.6 69 0 63.4 0Z" fillOpacity="0.85"/>
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Meta Business</span>
            </div>
            {/* ElevenLabs */}
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="2" width="3" height="20" rx="1.5"/>
                <rect x="13" y="2" width="3" height="20" rx="1.5"/>
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>ElevenLabs</span>
            </div>
            {/* Google for Startups */}
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fillOpacity="0.7"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillOpacity="0.5"/>
                <path d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.13-1.43.36-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l2.85-2.22.81-.62z" fillOpacity="0.6"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillOpacity="0.8"/>
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Google for Startups</span>
            </div>
            {/* Microsoft for Startups */}
            <div className="flex items-center gap-3 text-brand-muted/60 hover:text-brand-muted/90 transition-colors whitespace-nowrap">
              <svg width="26" height="26" viewBox="0 0 21 21" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="10" height="10" fillOpacity="0.7"/>
                <rect x="11" y="0" width="10" height="10" fillOpacity="0.5"/>
                <rect x="0" y="11" width="10" height="10" fillOpacity="0.6"/>
                <rect x="11" y="11" width="10" height="10" fillOpacity="0.8"/>
              </svg>
              <span className="text-[0.9375rem]" style={{ fontWeight: 600 }}>Microsoft for Startups</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
    </section>
  );
}