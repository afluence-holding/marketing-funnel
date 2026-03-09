export function PhoneMindfulness() {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0a0a12 0%, #0f0d1a 50%, #0a0f18 100%)",
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
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 50%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Phone device */}
      <div
        className="relative flex flex-col"
        style={{
          width: "100px",
          height: "200px",
          borderRadius: "16px",
          border: "2px solid rgba(255,255,255,0.12)",
          background: "#111118",
          boxShadow:
            "0 0 30px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
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
            background: "linear-gradient(165deg, #0f0a1e 0%, #1a1035 40%, #0d1b2a 100%)",
          }}
        >
          {/* Status bar */}
          <div className="w-full flex items-center justify-between px-2 pt-1" style={{ fontSize: "0.3rem" }}>
            <span className="text-white/60">9:41</span>
            <div className="flex gap-0.5 items-center">
              <div className="w-1 h-0.5 rounded-sm bg-white/50" />
              <div className="w-1 h-0.5 rounded-sm bg-white/50" />
              <div className="w-2 h-0.5 rounded-sm bg-white/60" />
            </div>
          </div>

          {/* App content */}
          <div className="flex flex-col items-center w-full flex-1 px-2 pt-2">
            {/* Greeting */}
            <p className="text-white/50 mb-0.5" style={{ fontSize: "0.28rem" }}>
              Buenas noches
            </p>
            <p className="text-white mb-1" style={{ fontSize: "0.4rem", fontWeight: 600 }}>
              ¿Listo para meditar?
            </p>

            {/* Breathing circle */}
            <div className="relative flex items-center justify-center my-1.5">
              {/* Outer glow ring */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "44px",
                  height: "44px",
                  background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
                }}
              />
              {/* Middle ring */}
              <div
                className="absolute rounded-full border border-purple-400/30"
                style={{ width: "36px", height: "36px" }}
              />
              {/* Inner circle */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "28px",
                  height: "28px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%)",
                  boxShadow: "0 0 16px rgba(139,92,246,0.5)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" />
                </svg>
              </div>
            </div>

            <p className="text-purple-300/80 mt-0.5" style={{ fontSize: "0.26rem", fontWeight: 500 }}>
              Inhala · Exhala
            </p>

            {/* Session cards */}
            <div className="w-full mt-2 space-y-[3px]">
              <div
                className="w-full rounded px-1.5 py-[3px] flex items-center gap-1"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <div
                  className="rounded flex items-center justify-center shrink-0"
                  style={{ width: "12px", height: "12px", background: "rgba(139,92,246,0.3)" }}
                >
                  <svg width="5" height="5" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.26rem", fontWeight: 600 }}>
                    Calma interior
                  </p>
                  <p className="text-white/40" style={{ fontSize: "0.2rem" }}>
                    10 min · Meditación guiada
                  </p>
                </div>
              </div>

              <div
                className="w-full rounded px-1.5 py-[3px] flex items-center gap-1"
                style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.15)" }}
              >
                <div
                  className="rounded flex items-center justify-center shrink-0"
                  style={{ width: "12px", height: "12px", background: "rgba(56,189,248,0.25)" }}
                >
                  <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 3v18M3 12h18" />
                  </svg>
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.26rem", fontWeight: 600 }}>
                    Respiración 4-7-8
                  </p>
                  <p className="text-white/40" style={{ fontSize: "0.2rem" }}>
                    5 min · Ejercicio
                  </p>
                </div>
              </div>

              <div
                className="w-full rounded px-1.5 py-[3px] flex items-center gap-1"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.15)" }}
              >
                <div
                  className="rounded flex items-center justify-center shrink-0"
                  style={{ width: "12px", height: "12px", background: "rgba(52,211,153,0.25)" }}
                >
                  <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.26rem", fontWeight: 600 }}>
                    Sueño profundo
                  </p>
                  <p className="text-white/40" style={{ fontSize: "0.2rem" }}>
                    20 min · Historia para dormir
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom nav bar */}
            <div className="w-full mt-auto pt-1 pb-0.5 flex items-center justify-around border-t border-white/5">
              {[
                { label: "Inicio", active: true },
                { label: "Explorar", active: false },
                { label: "Stats", active: false },
                { label: "Perfil", active: false },
              ].map((tab) => (
                <div key={tab.label} className="flex flex-col items-center gap-px">
                  <div
                    className="rounded-full"
                    style={{
                      width: "3px",
                      height: "3px",
                      background: tab.active ? "#a855f7" : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.18rem",
                      color: tab.active ? "#a855f7" : "rgba(255,255,255,0.3)",
                      fontWeight: tab.active ? 600 : 400,
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
              ))}
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
