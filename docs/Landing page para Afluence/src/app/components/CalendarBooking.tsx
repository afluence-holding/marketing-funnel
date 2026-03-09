import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Lock,
  CalendarCheck,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { CalendarState } from "./LeadForm";

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

interface CalendarBookingProps {
  calendarState: CalendarState;
}

export function CalendarBooking({ calendarState }: CalendarBookingProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showUnlockedBadge, setShowUnlockedBadge] = useState(false);
  const [booked, setBooked] = useState(false);

  const isLocked = calendarState === "locked";
  const isRejected =
    calendarState === "rejected" || calendarState === "rejected-whatsapp";
  const isUnlocked = calendarState === "unlocked";

  // Show unlock badge briefly
  useMemo(() => {
    if (isUnlocked && !booked) {
      setShowUnlockedBadge(true);
      const timer = setTimeout(() => setShowUnlockedBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, booked]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    return date < today || dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (!isUnlocked || isDateDisabled(day)) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setSelectedTime(null);
  };

  const canGoPrev =
    !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const prevMonth = () => {
    if (!canGoPrev || !isUnlocked) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (!isUnlocked) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS_ES[selectedDate.getMonth()]}`;
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="rounded-2xl border border-brand-success/20 bg-brand-surface/60 backdrop-blur-2xl p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mx-auto mb-5">
          <CalendarCheck className="w-7 h-7 text-brand-success" />
        </div>
        <h3
          className="text-[1.25rem] text-brand-text mb-2"
          style={{ fontWeight: 700 }}
        >
          Reunión agendada
        </h3>
        <p
          className="text-[0.875rem] text-brand-text-secondary mb-4"
          style={{ lineHeight: 1.7 }}
        >
          {formatSelectedDate()} a las {selectedTime}
        </p>
        <p
          className="text-[0.75rem] text-brand-muted"
          style={{ lineHeight: 1.6 }}
        >
          Recibirás confirmación por WhatsApp y un correo con los detalles.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden h-full flex flex-col">
      {/* ── Calendar Content ── */}
      <div
        className={`flex-1 p-5 md:p-6 transition-all duration-700 ${
          isLocked || isRejected ? "blur-[14px] pointer-events-none select-none" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-[#a78bfa] flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="text-[0.875rem] text-brand-text"
              style={{ fontWeight: 600 }}
            >
              Sesión estratégica
            </p>
            <div className="flex items-center gap-2 text-[0.6875rem] text-brand-muted">
              <Clock className="w-3 h-3" />
              <span>45 min</span>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              canGoPrev
                ? "hover:bg-brand-surface-elevated text-brand-text-secondary hover:text-brand-text cursor-pointer"
                : "text-brand-muted/30 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span
            className="text-[0.8125rem] text-brand-text"
            style={{ fontWeight: 600 }}
          >
            {MONTHS_ES[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-surface-elevated text-brand-accent hover:text-brand-accent-hover transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {DAYS_ES.map((d) => (
            <div
              key={d}
              className="text-center text-[0.625rem] text-brand-muted py-1.5"
              style={{ fontWeight: 600 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const disabled = isDateDisabled(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled || !isUnlocked}
                className={`
                  relative w-full aspect-square rounded-full flex items-center justify-center text-[0.75rem] transition-all
                  ${
                    disabled
                      ? "text-brand-muted/20 cursor-not-allowed"
                      : selected
                      ? "bg-brand-accent text-white shadow-[0_0_15px_rgba(108,92,231,0.4)] cursor-pointer"
                      : todayMark
                      ? "text-brand-accent border border-brand-accent/30 cursor-pointer hover:bg-brand-accent/10"
                      : "text-brand-text-secondary hover:bg-brand-surface-elevated cursor-pointer"
                  }
                `}
                style={{ fontWeight: selected || todayMark ? 600 : 400 }}
              >
                {day}
                {todayMark && !selected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-accent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Timezone */}
        <div className="mt-4 pt-3 border-t border-brand-border">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-brand-surface-elevated/50 border border-brand-border">
            <Globe className="w-3 h-3 text-brand-muted" />
            <span className="text-[0.6875rem] text-brand-text-secondary">
              GMT-06:00 America/Mexico_City
            </span>
          </div>
        </div>

        {/* Time Slots — only shown when unlocked + date selected */}
        <AnimatePresence>
          {isUnlocked && selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3 border-t border-brand-border">
                <p
                  className="text-[0.75rem] text-brand-muted mb-2"
                  style={{ fontWeight: 500 }}
                >
                  {formatSelectedDate()} — Horarios disponibles
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((time) => {
                    const isActive = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-2 py-2 rounded-lg border text-[0.6875rem] transition-all cursor-pointer text-center whitespace-nowrap ${
                          isActive
                            ? "border-brand-accent bg-brand-accent text-white shadow-[0_0_15px_rgba(108,92,231,0.3)]"
                            : "border-brand-accent/25 text-brand-accent hover:bg-brand-accent/10"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm button */}
        <AnimatePresence>
          {isUnlocked && selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-[0.8125rem] transition-all cursor-pointer shadow-[0_0_30px_rgba(108,92,231,0.4)] hover:shadow-[0_0_40px_rgba(108,92,231,0.5)] active:scale-[0.98]"
                style={{ fontWeight: 600 }}
              >
                Confirmar — {formatSelectedDate()} a las {selectedTime}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════ OVERLAYS ══════════ */}

      {/* ── Locked Overlay ── */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-surface-elevated/80 border border-brand-border flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Lock className="w-6 h-6 text-brand-muted" />
            </div>
            <h4
              className="text-[1rem] text-brand-text mb-2"
              style={{ fontWeight: 600 }}
            >
              Completa el formulario para desbloquear
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[260px]"
              style={{ lineHeight: 1.6 }}
            >
              Toma menos de 1 minuto.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rejected Overlay (Investment) ── */}
      <AnimatePresence>
        {calendarState === "rejected" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <h4
              className="text-[1rem] text-brand-text mb-2"
              style={{ fontWeight: 600 }}
            >
              Nuestros desarrollos comienzan desde USD $7,000
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5"
              style={{ lineHeight: 1.6 }}
            >
              Actualmente no podemos desbloquear el calendario para este rango de inversión.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]"
              style={{ fontWeight: 600 }}
              onClick={() => window.open("https://byafluence.com", "_blank")}
            >
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rejected Overlay (WhatsApp) ── */}
      <AnimatePresence>
        {calendarState === "rejected-whatsapp" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <MessageCircle className="w-6 h-6 text-amber-400" />
            </div>
            <h4
              className="text-[1rem] text-brand-text mb-2"
              style={{ fontWeight: 600 }}
            >
              Reservamos reuniones solo para proyectos confirmados
            </h4>
            <p
              className="text-[0.8125rem] text-brand-muted max-w-[280px] mb-5"
              style={{ lineHeight: 1.6 }}
            >
              La confirmación por WhatsApp es necesaria para revisar tu proyecto antes de la sesión.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[0.8125rem]"
              style={{ fontWeight: 600 }}
              onClick={() => window.open("https://byafluence.com", "_blank")}
            >
              Unirme a lista de espera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Unlocked Badge ── */}
      <AnimatePresence>
        {showUnlockedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-success/15 border border-brand-success/25 backdrop-blur-xl shadow-[0_4px_30px_rgba(16,185,129,0.2)]">
              <CalendarCheck className="w-4 h-4 text-brand-success" />
              <span
                className="text-[0.75rem] text-brand-success whitespace-nowrap"
                style={{ fontWeight: 600 }}
              >
                Listo para agendar
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
