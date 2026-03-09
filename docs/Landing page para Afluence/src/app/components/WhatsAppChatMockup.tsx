export function WhatsAppChatMockup() {
  const messages = [
    { from: "bot", text: "¡Hola María! 👋 Soy Ana, asistente de Diego Coaching. Vi que descargaste la guía de productividad. ¿Te fue útil?", time: "10:02" },
    { from: "user", text: "Sí, me encantó! Quiero saber más sobre el programa", time: "10:04" },
    { from: "bot", text: "¡Genial! 🎯 El programa incluye 8 sesiones 1:1, acceso a la comunidad y soporte por WhatsApp. ¿Te gustaría agendar una llamada para conocer los detalles?", time: "10:04" },
    { from: "user", text: "Sí, por favor", time: "10:05" },
    { from: "bot", text: "Perfecto ✅ Tengo disponibilidad mañana a las 11am o el jueves a las 3pm. ¿Cuál te queda mejor?", time: "10:05" },
    { from: "user", text: "Mañana a las 11 🙌", time: "10:06" },
    { from: "bot", text: "¡Listo! Agendada tu llamada para mañana a las 11:00 AM 📅 Te enviaré un recordatorio. ¡Nos vemos!", time: "10:06" },
  ];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0a0a12 0%, #071210 50%, #0a0f18 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "160px",
          height: "160px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(37,211,102,0.15) 0%, rgba(37,211,102,0.04) 50%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Phone device */}
      <div
        className="relative flex flex-col"
        style={{
          width: "110px",
          height: "210px",
          borderRadius: "16px",
          border: "2px solid rgba(255,255,255,0.12)",
          background: "#111118",
          boxShadow:
            "0 0 30px rgba(37,211,102,0.1), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Notch */}
        <div className="flex justify-center pt-1 pb-0.5" style={{ background: "#111118" }}>
          <div
            className="rounded-full"
            style={{
              width: "28px",
              height: "5px",
              background: "#1a1a24",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />
        </div>

        {/* Screen */}
        <div
          className="flex-1 flex flex-col overflow-hidden mx-[3px] mb-[3px] rounded-b-[12px]"
          style={{ background: "#0b141a" }}
        >
          {/* WhatsApp header */}
          <div
            className="flex items-center gap-1 px-1.5 py-1"
            style={{ background: "#1f2c34", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Back arrow */}
            <svg width="4" height="4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: "12px", height: "12px", background: "linear-gradient(135deg, #25D366, #128C7E)" }}
            >
              <svg width="6" height="6" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: "0.28rem", fontWeight: 600 }}>
                Ana · IA Setter
              </p>
              <p className="text-[#25D366]" style={{ fontSize: "0.18rem" }}>
                en línea
              </p>
            </div>
            {/* Icons */}
            <div className="flex gap-1 items-center">
              <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91" />
              </svg>
              <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto px-1 py-1 space-y-[3px]"
            style={{
              background: "linear-gradient(180deg, #0b141a 0%, #0d1a1f 100%)",
            }}
          >
            {/* Date pill */}
            <div className="flex justify-center mb-0.5">
              <span
                className="rounded-full px-1.5 py-px"
                style={{
                  fontSize: "0.17rem",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Hoy
              </span>
            </div>

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="rounded-md px-1 py-[2px] max-w-[85%] relative"
                  style={{
                    background: msg.from === "user" ? "#005c4b" : "#1f2c34",
                    borderTopLeftRadius: msg.from === "bot" ? "2px" : undefined,
                    borderTopRightRadius: msg.from === "user" ? "2px" : undefined,
                  }}
                >
                  <p className="text-white/90" style={{ fontSize: "0.22rem", lineHeight: 1.45 }}>
                    {msg.text}
                  </p>
                  <div className="flex justify-end items-center gap-0.5 mt-px">
                    <span className="text-white/30" style={{ fontSize: "0.15rem" }}>
                      {msg.time}
                    </span>
                    {msg.from === "user" && (
                      <svg width="4" height="4" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-1 px-1 py-[3px]"
            style={{ background: "#1f2c34", borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
            <div
              className="flex-1 rounded-full px-1.5 py-[2px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span className="text-white/25" style={{ fontSize: "0.2rem" }}>
                Mensaje
              </span>
            </div>
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: "10px", height: "10px", background: "#25D366" }}
            >
              <svg width="5" height="5" viewBox="0 0 24 24" fill="white">
                <path d="M12 2a10 10 0 00-3.16 19.5l-1.34 3.5 3.8-2a10 10 0 100-21z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center py-[2px]" style={{ background: "#111118" }}>
          <div
            className="rounded-full"
            style={{ width: "24px", height: "2px", background: "rgba(255,255,255,0.15)" }}
          />
        </div>
      </div>
    </div>
  );
}
