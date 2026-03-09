export function WhatsAppCallMockup() {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0a0a12 0%, #0a1015 50%, #0a0f18 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "180px",
          height: "180px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(37,211,102,0.12) 0%, rgba(37,211,102,0.03) 50%, transparent 70%)",
          filter: "blur(12px)",
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
            "0 0 30px rgba(37,211,102,0.08), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
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
          className="flex-1 flex flex-col items-center overflow-hidden mx-[3px] mb-[3px] rounded-b-[12px]"
          style={{
            background: "linear-gradient(180deg, #075e54 0%, #054d44 30%, #032b26 100%)",
          }}
        >
          {/* Top bar - encrypted label */}
          <div className="w-full flex items-center justify-center pt-1.5 pb-0.5">
            <svg width="4" height="4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="text-white/35 ml-0.5" style={{ fontSize: "0.17rem" }}>
              Cifrado de extremo a extremo
            </span>
          </div>

          {/* Avatar + Name */}
          <div className="flex flex-col items-center mt-2 mb-1">
            {/* Avatar circle with pulse animation */}
            <div className="relative">
              {/* Pulse rings */}
              <div
                className="absolute rounded-full animate-ping"
                style={{
                  width: "40px",
                  height: "40px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(37,211,102,0.12)",
                  animationDuration: "2s",
                }}
              />
              <div
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  boxShadow: "0 0 20px rgba(37,211,102,0.3)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
            </div>

            <p className="text-white mt-1.5" style={{ fontSize: "0.35rem", fontWeight: 600 }}>
              Agente IA · Voz
            </p>
            <p className="text-[#25D366]" style={{ fontSize: "0.24rem", fontWeight: 500 }}>
              03:42
            </p>
          </div>

          {/* Live transcript overlay */}
          <div
            className="w-[90%] rounded-lg mt-1 px-1.5 py-1"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="flex items-center gap-0.5 mb-0.5">
              <div
                className="rounded-full"
                style={{ width: "3px", height: "3px", background: "#25D366" }}
              />
              <span className="text-[#25D366]" style={{ fontSize: "0.18rem", fontWeight: 600 }}>
                Transcripción en vivo
              </span>
            </div>
            <p className="text-white/70" style={{ fontSize: "0.2rem", lineHeight: 1.5 }}>
              <span className="text-[#25D366]" style={{ fontWeight: 600 }}>IA:</span> ¿Y cuántas personas tiene su equipo actualmente?
            </p>
            <p className="text-white/70 mt-[2px]" style={{ fontSize: "0.2rem", lineHeight: 1.5 }}>
              <span className="text-white/90" style={{ fontWeight: 600 }}>Cliente:</span> Somos 12, pero queremos crecer a 20...
            </p>
            <p className="text-white/70 mt-[2px]" style={{ fontSize: "0.2rem", lineHeight: 1.5 }}>
              <span className="text-[#25D366]" style={{ fontWeight: 600 }}>IA:</span> Perfecto. ¿Cuál es su presupuesto mensual para herramientas digitales?
            </p>
          </div>

          {/* Audio waveform */}
          <div className="flex items-end gap-[1.5px] mt-2 mb-1" style={{ height: "14px" }}>
            {[3, 6, 4, 8, 12, 7, 10, 14, 9, 5, 11, 8, 13, 6, 9, 4, 7, 11, 5, 8].map((h, idx) => (
              <div
                key={idx}
                className="rounded-full"
                style={{
                  width: "1.5px",
                  height: `${h}px`,
                  background: `rgba(37,211,102,${0.4 + (h / 14) * 0.5})`,
                  animation: `pulse ${1 + (idx % 3) * 0.3}s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Data being captured badge */}
          <div
            className="flex items-center gap-0.5 rounded-full px-2 py-[2px] mt-0.5"
            style={{
              background: "rgba(37,211,102,0.12)",
              border: "1px solid rgba(37,211,102,0.2)",
            }}
          >
            <svg width="4" height="4" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="text-[#25D366]" style={{ fontSize: "0.18rem", fontWeight: 500 }}>
              Capturando datos del CRM
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Call action buttons */}
          <div className="flex items-center justify-center gap-3 pb-3 pt-1">
            {/* Mute */}
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "18px",
                height: "18px",
                background: "rgba(255,255,255,0.12)",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </div>
            {/* End call */}
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "22px",
                height: "22px",
                background: "#e74c3c",
                boxShadow: "0 0 12px rgba(231,76,60,0.4)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.18-.29-.43-.29-.71 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </div>
            {/* Speaker */}
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "18px",
                height: "18px",
                background: "rgba(255,255,255,0.12)",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
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
