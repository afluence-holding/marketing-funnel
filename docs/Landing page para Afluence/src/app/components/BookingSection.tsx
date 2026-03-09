import { useState } from "react";
import { motion } from "motion/react";
import { CalendarBooking } from "./CalendarBooking";
import { LeadForm, type CalendarState } from "./LeadForm";

export function BookingSection() {
  const [calendarState, setCalendarState] = useState<CalendarState>("locked");

  return (
    <section id="formulario" className="relative py-20 md:py-28">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-accent/4 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span
            className="text-[0.75rem] uppercase tracking-[0.2em] text-brand-accent"
            style={{ fontWeight: 600 }}
          >
            Siguiente paso
          </span>
          <h2
            className="mt-4 text-[1.75rem] md:text-[2.5rem] text-brand-text tracking-tight"
            style={{ fontWeight: 700, lineHeight: 1.15 }}
          >
            Agendar reunión
          </h2>
          <p
            className="mt-4 text-[0.9375rem] text-brand-text-secondary max-w-[520px] mx-auto"
            style={{ lineHeight: 1.7 }}
          >
            Completa el diagnóstico y desbloquea el calendario para agendar tu sesión estratégica personalizada.
          </p>
        </div>

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-5 md:gap-6 items-start">
          {/* LEFT — Form (7/12 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[58.33%] min-h-[580px]"
          >
            <LeadForm
              calendarState={calendarState}
              onCalendarStateChange={setCalendarState}
            />
          </motion.div>

          {/* RIGHT — Calendar (5/12 cols, sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-[41.67%] lg:sticky lg:top-24"
          >
            <CalendarBooking calendarState={calendarState} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
