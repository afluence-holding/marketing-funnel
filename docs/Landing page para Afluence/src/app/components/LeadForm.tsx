import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  DollarSign,
  User,
  Briefcase,
  Layers,
  MessageCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ── Country codes (LATAM focus) ── */
const countryCodes = [
  { code: "+52", country: "MX", flag: "🇲🇽", name: "México" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Perú" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "+507", country: "PA", flag: "🇵🇦", name: "Panamá" },
  { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "España" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brasil" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "Reino Unido" },
];

/* ── Types ── */
export type CalendarState = "locked" | "unlocked" | "rejected" | "rejected-whatsapp";

type FormData = {
  nombre: string;
  email: string;
  countryCode: string;
  whatsapp: string;
  linkSocial: string;
  nicho: string;
  generaIngresos: string;
  facturacion: string;
  queConstruir: string[];
  inversion: string;
  timing: string;
  confirmaWhatsapp: string;
};

const initialData: FormData = {
  nombre: "",
  email: "",
  countryCode: "+52",
  whatsapp: "",
  linkSocial: "",
  nicho: "",
  generaIngresos: "",
  facturacion: "",
  queConstruir: [],
  inversion: "",
  timing: "",
  confirmaWhatsapp: "",
};

/* ── Options ── */
const nichos = [
  "Fitness",
  "Nutrición",
  "Coaching",
  "Educación",
  "Entretenimiento",
  "Finanzas",
  "Tecnología",
  "Lifestyle",
  "Belleza",
  "Otro",
];

const facturaciones = [
  "Aún no monetizo",
  "0–1K USD",
  "1–5K USD",
  "5–20K USD",
  "20K+ USD",
];

const productos = [
  "App para mi audiencia",
  "Reto con IA",
  "Membresía",
  "Curso digital",
  "Automatización con IA",
  "Agentes de voz",
  "Plataforma web",
  "No estoy seguro",
];

const inversiones = [
  { label: "Sí, estoy listo para invertir desde 7K", value: "ready" },
  { label: "Estoy evaluando ese rango", value: "evaluating" },
  { label: "Busco algo menor", value: "lower" },
];

const timings = [
  "Inmediatamente",
  "1–3 meses",
  "3–6 meses",
  "Explorando",
];

const whatsappOptions = [
  { label: "Perfecto, espero el mensaje", value: "yes" },
  { label: "No voy a confirmar la reunión", value: "no" },
];

/* ── Step meta ── */
const stepsMeta = [
  { icon: User, label: "Perfil", time: "~30s" },
  { icon: Briefcase, label: "Negocio", time: "~20s" },
  { icon: Layers, label: "Proyecto", time: "~15s" },
  { icon: DollarSign, label: "Inversión", time: "~10s" },
  { icon: MessageCircle, label: "Confirmar", time: "~10s" },
];

const TOTAL_STEPS = 5;

/* ── Component ── */
interface LeadFormProps {
  onCalendarStateChange: (state: CalendarState) => void;
  calendarState: CalendarState;
}

export function LeadForm({ onCalendarStateChange, calendarState }: LeadFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const update = (field: keyof FormData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleProduct = (product: string) => {
    setData((prev) => ({
      ...prev,
      queConstruir: prev.queConstruir.includes(product)
        ? prev.queConstruir.filter((p) => p !== product)
        : [...prev.queConstruir, product],
    }));
  };

  /* ── Validation per step ── */
  const canNext = () => {
    if (step === 1)
      return data.nombre && data.email && data.whatsapp && data.linkSocial && data.nicho;
    if (step === 2) return data.generaIngresos && data.facturacion;
    if (step === 3) return data.queConstruir.length > 0;
    if (step === 4) return data.inversion;
    if (step === 5) return data.timing && data.confirmaWhatsapp;
    return false;
  };

  const handleNext = () => {
    if (step === 4 && data.inversion === "lower") {
      onCalendarStateChange("rejected");
      setDirection(1);
      setStep(step + 1);
      return;
    }

    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    // Reset rejected state if going back from step 5
    if (calendarState === "rejected" && step === 5) {
      onCalendarStateChange("locked");
    }
    if (calendarState === "rejected-whatsapp" && step === 5) {
      onCalendarStateChange("locked");
    }
    setDirection(-1);
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (data.confirmaWhatsapp === "no") {
      onCalendarStateChange("rejected-whatsapp");
      setSubmitted(true);
      return;
    }
    console.log("Lead data:", data);
    onCalendarStateChange("unlocked");
    setSubmitted(true);
  };

  const isRejected = calendarState === "rejected" || calendarState === "rejected-whatsapp";

  /* ── Submitted states ── */
  if (submitted) {
    if (calendarState === "rejected-whatsapp") {
      return (
        <div className="h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-amber-500/20 bg-brand-surface/80 backdrop-blur-xl p-8 text-center w-full"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-7 h-7 text-amber-400" />
            </div>
            <h3
              className="text-[1.25rem] text-brand-text mb-3"
              style={{ fontWeight: 700 }}
            >
              Reservamos reuniones solo para proyectos confirmados por WhatsApp
            </h3>
            <p
              className="text-[0.875rem] text-brand-text-secondary mb-6"
              style={{ lineHeight: 1.7 }}
            >
              Entendemos. Si cambias de opinión, puedes unirte a nuestra lista de espera y te contactaremos cuando haya disponibilidad.
            </p>
            <button
              className="px-6 py-3 rounded-xl border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 transition-all cursor-pointer"
              style={{ fontWeight: 600 }}
              onClick={() => window.open("https://byafluence.com", "_blank")}
            >
              Unirme a lista de espera
            </button>
          </motion.div>
        </div>
      );
    }

    if (calendarState === "unlocked") {
      return (
        <div className="h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-brand-success/20 bg-brand-surface/80 backdrop-blur-xl p-8 text-center w-full"
          >
            <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7 text-brand-success" />
            </div>
            <h3
              className="text-[1.25rem] text-brand-text mb-2"
              style={{ fontWeight: 700 }}
            >
              Listo, {data.nombre}. Ahora puedes agendar.
            </h3>
            <p
              className="text-[0.875rem] text-brand-text-secondary mb-1"
              style={{ lineHeight: 1.7 }}
            >
              Selecciona una fecha y horario en el calendario para tu sesión estratégica.
            </p>
            <p
              className="text-[0.75rem] text-brand-muted"
              style={{ lineHeight: 1.6 }}
            >
              Recibirás confirmación por WhatsApp y email.
            </p>
          </motion.div>
        </div>
      );
    }
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full">
      {/* ── Stepper ── */}
      <div className="px-5 pt-5 pb-0 md:px-7 md:pt-7">
        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-4">
          {stepsMeta.map((s, i) => {
            const Icon = s.icon;
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-[0.6875rem] whitespace-nowrap ${
                    isActive
                      ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                      : isDone
                      ? "text-brand-success"
                      : "text-brand-muted/50"
                  }`}
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  {isDone ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <div
                    className={`flex-1 h-px mx-1 ${
                      isDone ? "bg-brand-success/30" : "bg-brand-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[0.75rem] text-brand-muted"
              style={{ fontWeight: 500 }}
            >
              Paso {step} de {TOTAL_STEPS}
            </span>
            <span
              className="text-[0.6875rem] text-brand-muted/60"
              style={{ fontWeight: 400 }}
            >
              {stepsMeta[step - 1]?.time}
            </span>
          </div>
          <div className="h-1 rounded-full bg-brand-surface-elevated overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-accent to-[#a78bfa]"
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 px-5 py-5 md:px-7 md:py-5 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── STEP 1: Perfil ── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3
                  className="text-[1.0625rem] text-brand-text mb-1"
                  style={{ fontWeight: 600 }}
                >
                  Cuéntanos sobre ti
                </h3>
                <FormField label="Nombre completo" required>
                  <input
                    type="text"
                    value={data.nombre}
                    onChange={(e) => update("nombre", e.target.value)}
                    placeholder="Tu nombre"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Email" required>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="tu@email.com"
                    className="form-input"
                  />
                </FormField>
                <FormField label="WhatsApp" required>
                  <WhatsAppInput
                    countryCode={data.countryCode}
                    phone={data.whatsapp}
                    onCountryCodeChange={(code) => update("countryCode", code)}
                    onPhoneChange={(phone) => update("whatsapp", phone)}
                  />
                </FormField>
                <FormField label="Link IG / TikTok / YouTube" required>
                  <input
                    type="url"
                    value={data.linkSocial}
                    onChange={(e) => update("linkSocial", e.target.value)}
                    placeholder="https://instagram.com/tu_perfil"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Nicho" required>
                  <select
                    value={data.nicho}
                    onChange={(e) => update("nicho", e.target.value)}
                    className="form-input appearance-none cursor-pointer"
                  >
                    <option
                      value=""
                      style={{ background: "#1C1C26", color: "#71717A" }}
                    >
                      Seleccionar nicho
                    </option>
                    {nichos.map((n) => (
                      <option
                        key={n}
                        value={n}
                        style={{ background: "#1C1C26", color: "#F5F5F7" }}
                      >
                        {n}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            {/* ── STEP 2: Negocio ── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h3
                  className="text-[1.0625rem] text-brand-text mb-1"
                  style={{ fontWeight: 600 }}
                >
                  Tu negocio actual
                </h3>
                <FormField label="¿Tu negocio actualmente genera ingresos?" required>
                  <div className="grid grid-cols-2 gap-2">
                    {["Sí", "No"].map((opt) => (
                      <RadioButton
                        key={opt}
                        label={opt}
                        selected={data.generaIngresos === opt}
                        onClick={() => update("generaIngresos", opt)}
                      />
                    ))}
                  </div>
                </FormField>
                <FormField label="Facturación mensual aproximada" required>
                  <div className="flex flex-col gap-2">
                    {facturaciones.map((f) => (
                      <RadioButton
                        key={f}
                        label={f}
                        selected={data.facturacion === f}
                        onClick={() => update("facturacion", f)}
                      />
                    ))}
                  </div>
                </FormField>
              </div>
            )}

            {/* ── STEP 3: Qué quieres construir ── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h3
                  className="text-[1.0625rem] text-brand-text mb-1"
                  style={{ fontWeight: 600 }}
                >
                  ¿Qué quieres construir?
                </h3>
                <p
                  className="text-[0.8125rem] text-brand-muted -mt-2"
                  style={{ lineHeight: 1.6 }}
                >
                  Selecciona todo lo que aplique.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {productos.map((p) => {
                    const isChecked = data.queConstruir.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => toggleProduct(p)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-[0.8125rem] transition-all cursor-pointer text-left ${
                          isChecked
                            ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(108,92,231,0.1)]"
                            : "border-brand-border bg-brand-surface-elevated/50 text-brand-text-secondary hover:border-brand-border-hover hover:bg-brand-surface-elevated"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-brand-accent border-brand-accent"
                              : "border-brand-border"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 4: Filtro económico ── */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h3
                  className="text-[1.0625rem] text-brand-text mb-1"
                  style={{ fontWeight: 600 }}
                >
                  Inversión
                </h3>

                {/* Callout */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-accent/6 border border-brand-accent/15">
                  <Info className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                  <p
                    className="text-[0.8125rem] text-brand-text-secondary"
                    style={{ lineHeight: 1.7 }}
                  >
                    Los desarrollos de Afluence comienzan desde{" "}
                    <span
                      className="text-brand-accent"
                      style={{ fontWeight: 600 }}
                    >
                      USD $7,000
                    </span>
                    .
                  </p>
                </div>

                <FormField
                  label="¿Te gustaría invertir en ese rango para tu proyecto?"
                  required
                >
                  <div className="flex flex-col gap-2">
                    {inversiones.map((inv) => (
                      <RadioButton
                        key={inv.value}
                        label={inv.label}
                        selected={data.inversion === inv.value}
                        onClick={() => update("inversion", inv.value)}
                        variant={
                          inv.value === "lower" && data.inversion === "lower"
                            ? "warning"
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </FormField>

                {data.inversion === "lower" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p
                      className="text-[0.75rem] text-amber-400/80"
                      style={{ lineHeight: 1.6 }}
                    >
                      Al continuar serás redirigido a nuestra lista de espera. El calendario no se desbloqueará.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 5: Timing + Confirmación WhatsApp ── */}
            {step === 5 && (
              <div className="flex flex-col gap-5">
                {calendarState === "rejected" ? (
                  /* Rejected state — show waitlist */
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                      <DollarSign className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3
                      className="text-[1.125rem] text-brand-text mb-3"
                      style={{ fontWeight: 700 }}
                    >
                      Nuestros desarrollos comienzan desde USD $7,000
                    </h3>
                    <p
                      className="text-[0.8125rem] text-brand-text-secondary mb-6"
                      style={{ lineHeight: 1.7 }}
                    >
                      Entendemos que puede no ser el momento. Te invitamos a unirte a nuestra lista de espera para cuando estés listo.
                    </p>
                    <button
                      className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(108,92,231,0.3)]"
                      style={{ fontWeight: 600 }}
                      onClick={() =>
                        window.open("https://byafluence.com", "_blank")
                      }
                    >
                      Unirme a lista de espera
                    </button>
                  </div>
                ) : (
                  <>
                    <h3
                      className="text-[1.0625rem] text-brand-text mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      Último paso
                    </h3>
                    <FormField label="¿Cuándo te gustaría lanzar?" required>
                      <div className="grid grid-cols-2 gap-2">
                        {timings.map((t) => (
                          <RadioButton
                            key={t}
                            label={t}
                            selected={data.timing === t}
                            onClick={() => update("timing", t)}
                            icon={<Clock className="w-3.5 h-3.5" />}
                          />
                        ))}
                      </div>
                    </FormField>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-accent/6 border border-brand-accent/15">
                      <MessageCircle className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                      <p
                        className="text-[0.8125rem] text-brand-text-secondary"
                        style={{ lineHeight: 1.7 }}
                      >
                        Al agendar la reunión, debes{" "}
                        <span className="text-brand-text" style={{ fontWeight: 500 }}>
                          confirmarla por WhatsApp
                        </span>{" "}
                        para que podamos revisar tu proyecto.
                      </p>
                    </div>

                    <FormField label="Confirmación" required>
                      <div className="flex flex-col gap-2">
                        {whatsappOptions.map((opt) => (
                          <RadioButton
                            key={opt.value}
                            label={opt.label}
                            selected={data.confirmaWhatsapp === opt.value}
                            onClick={() => update("confirmaWhatsapp", opt.value)}
                            variant={
                              opt.value === "no" &&
                              data.confirmaWhatsapp === "no"
                                ? "warning"
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </FormField>

                    {data.confirmaWhatsapp === "no" && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15"
                      >
                        <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p
                          className="text-[0.75rem] text-amber-400/80"
                          style={{ lineHeight: 1.6 }}
                        >
                          Sin confirmación por WhatsApp no podemos agendar. Podrás unirte a la lista de espera.
                        </p>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      {!(step === 5 && calendarState === "rejected") && !submitted && (
        <div className="px-5 pb-5 pt-0 md:px-7 md:pb-7 border-t border-brand-border">
          <div className="flex items-center justify-between pt-5">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[0.8125rem] transition-all ${
                step === 1
                  ? "border-brand-border/30 text-brand-muted/30 cursor-not-allowed"
                  : "border-brand-border text-brand-text-secondary hover:text-brand-text hover:border-brand-border-hover hover:bg-brand-surface/50 cursor-pointer"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.8125rem] text-white transition-all ${
                canNext()
                  ? "bg-brand-accent hover:bg-brand-accent-hover cursor-pointer shadow-[0_0_20px_rgba(108,92,231,0.3)] hover:shadow-[0_0_30px_rgba(108,92,231,0.5)] active:scale-[0.98]"
                  : "bg-brand-muted/20 cursor-not-allowed opacity-40"
              }`}
              style={{ fontWeight: 600 }}
            >
              {step === TOTAL_STEPS
                ? data.confirmaWhatsapp === "no"
                  ? "Lista de espera"
                  : "Desbloquear calendario"
                : "Continuar"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable sub-components ── */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[0.8125rem] text-brand-text-secondary"
        style={{ fontWeight: 500 }}
      >
        {label}
        {required && <span className="text-brand-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioButton({
  label,
  selected,
  onClick,
  variant,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "warning";
  icon?: React.ReactNode;
}) {
  const isWarning = variant === "warning" && selected;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-[0.8125rem] transition-all cursor-pointer text-left ${
        isWarning
          ? "border-amber-500/30 bg-amber-500/8 text-amber-400"
          : selected
          ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(108,92,231,0.1)]"
          : "border-brand-border bg-brand-surface-elevated/50 text-brand-text-secondary hover:border-brand-border-hover hover:bg-brand-surface-elevated"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
          isWarning
            ? "border-amber-500"
            : selected
            ? "border-brand-accent"
            : "border-brand-muted/30"
        }`}
      >
        {selected && (
          <div
            className={`w-2 h-2 rounded-full ${
              isWarning ? "bg-amber-500" : "bg-brand-accent"
            }`}
          />
        )}
      </div>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

function WhatsAppInput({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
}: {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = countryCodes.find((c) => c.code === countryCode) || countryCodes[0];

  const filtered = search
    ? countryCodes.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search) ||
          c.country.toLowerCase().includes(search.toLowerCase())
      )
    : countryCodes;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-stretch gap-0 rounded-xl overflow-visible relative" ref={ref}>
      {/* Country code trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="flex items-center gap-1.5 px-3 rounded-l-xl bg-brand-surface-elevated/80 border border-brand-border border-r-0 text-brand-text hover:bg-brand-surface-elevated transition-all cursor-pointer flex-shrink-0"
      >
        <span className="text-[1rem]">{selected.flag}</span>
        <span className="text-[0.75rem] text-brand-text-secondary" style={{ fontWeight: 500 }}>
          {selected.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Phone input */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="55 1234 5678"
        className="flex-1 min-w-0 px-3 py-2.5 rounded-r-xl bg-brand-surface-elevated/80 border border-brand-border border-l-0 text-brand-text text-[0.8125rem] placeholder:text-brand-muted/40 focus:outline-none transition-all"
        style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-full max-h-[220px] rounded-xl border border-brand-border bg-brand-surface-elevated shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col"
          >
            {/* Search */}
            <div className="p-2 border-b border-brand-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-brand-bg/60 border border-brand-border text-[0.75rem] text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent/30"
                autoFocus
              />
            </div>
            {/* List */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-center text-[0.75rem] text-brand-muted">
                  Sin resultados
                </div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.code + c.country}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(c.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-brand-accent/8 transition-colors cursor-pointer ${
                    c.code === countryCode ? "bg-brand-accent/10" : ""
                  }`}
                >
                  <span className="text-[0.9375rem]">{c.flag}</span>
                  <span className="text-[0.75rem] text-brand-text flex-1" style={{ fontWeight: 400 }}>
                    {c.name}
                  </span>
                  <span className="text-[0.6875rem] text-brand-muted" style={{ fontWeight: 500 }}>
                    {c.code}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}