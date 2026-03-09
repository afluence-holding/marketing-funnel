import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Servicios", id: "servicios" },
    { label: "Casos", id: "casos" },
    { label: "Cómo funciona", id: "como-funciona" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-brand-bg/80 backdrop-blur-2xl border-b border-brand-border shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1240px] px-4 md:px-20 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center shadow-[0_0_20px_rgba(108,92,231,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[1.25rem] tracking-tight text-brand-text" style={{ fontWeight: 700 }}>
            Afluence
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="relative text-[0.875rem] text-brand-text-secondary hover:text-brand-text transition-colors cursor-pointer group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={() => scrollTo("formulario")}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white text-[0.875rem] transition-all cursor-pointer shadow-[0_0_20px_rgba(108,92,231,0.3)] hover:shadow-[0_0_30px_rgba(108,92,231,0.5)] active:scale-[0.98]"
          style={{ fontWeight: 600 }}
        >
          Agendar reunión
        </button>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => scrollTo("formulario")}
            className="px-3 py-2 rounded-lg bg-brand-accent text-white text-[0.75rem] cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Agendar
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-brand-text cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-brand-bg/95 backdrop-blur-2xl border-t border-brand-border overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(link.id)}
                  className="text-left px-4 py-3 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface-elevated transition-colors cursor-pointer"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => scrollTo("formulario")}
                className="mt-2 px-4 py-3 rounded-lg bg-brand-accent text-white text-center cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                Agendar reunión
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}