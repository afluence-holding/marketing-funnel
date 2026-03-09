import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-brand-border bg-brand-surface/20">
      <div className="mx-auto max-w-[1240px] px-4 md:px-20 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center shadow-[0_0_15px_rgba(108,92,231,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[1.0625rem] tracking-tight text-brand-text" style={{ fontWeight: 700 }}>
                Afluence
              </span>
            </div>
            <p className="text-[0.75rem] text-brand-muted max-w-[280px]" style={{ lineHeight: 1.7 }}>
              Construimos ecosistemas digitales para creadores de contenido en LATAM.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 md:gap-8">
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">
              Términos
            </a>
            <a href="#" className="text-[0.8125rem] text-brand-muted hover:text-brand-text transition-colors">
              Contacto
            </a>
          </div>

          {/* Social Placeholders */}
          <div className="flex items-center gap-3">
            {[
              { label: "IG", href: "#" },
              { label: "TW", href: "#" },
              { label: "LI", href: "#" },
              { label: "YT", href: "#" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-lg border border-brand-border bg-brand-surface/50 flex items-center justify-center text-[0.6875rem] text-brand-muted hover:text-brand-accent hover:border-brand-accent/25 hover:bg-brand-accent/5 transition-all"
                style={{ fontWeight: 600 }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.6875rem] text-brand-muted/60">
            &copy; 2026 Afluence. Todos los derechos reservados.
          </p>
          <p className="text-[0.6875rem] text-brand-muted/60">
            Hecho con cuidado para creadores que quieren más.
          </p>
        </div>
      </div>
    </footer>
  );
}
