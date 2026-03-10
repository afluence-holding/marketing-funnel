import videoThumb from "../../assets/f2de1b3e7ed330b1be51c6a7900efc3eb6cb47c9.png";

export function WhatsAppRetoMockup() {
  const messages: {
    from: "bot" | "user";
    text?: string;
    time: string;
    type?: "video" | "text";
  }[] = [
    {
      from: "bot",
      text: "¡Hola Camila! 🎉 Bienvenida al Reto 21 Días de Fitness con Ana Coach. Hoy es el Día 3: Movilidad + Core",
      time: "8:00",
    },
    {
      from: "user",
      text: "¡Lista! 💪 Dame el workout de hoy",
      time: "8:12",
    },
    {
      from: "bot",
      text: "Aquí tienes la rutina explicada paso a paso 👇",
      time: "8:12",
    },
    {
      from: "bot",
      type: "video",
      time: "8:12",
    },
    {
      from: "user",
      text: "Wooow qué bien explica todo 🔥 ya la hice completa",
      time: "8:45",
    },
    {
      from: "bot",
      text: "¡Increíble Camila! 🏆 Día 3 completado. Llevas 3/21 días — ¡vas con todo! Mañana: HIIT de 20 min 🚀",
      time: "8:46",
    },
  ];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #0a0a12 0%, #071210 50%, #0a0f18 100%)",
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
          background:
            "radial-gradient(circle, rgba(37,211,102,0.15) 0%, rgba(37,211,102,0.04) 50%, transparent 70%)",
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
        <div
          className="flex justify-center pt-1 pb-0.5"
          style={{ background: "#111118" }}
        >
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
            style={{
              background: "#1f2c34",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg
              width="4"
              height="4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: "12px",
                height: "12px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
              }}
            >
              <svg width="6" height="6" viewBox="0 0 24 24" fill="white">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-white truncate"
                style={{ fontSize: "0.28rem", fontWeight: 600 }}
              >
                Reto 21 Días · Ana Coach
              </p>
              <p className="text-[#25D366]" style={{ fontSize: "0.18rem" }}>
                bot IA
              </p>
            </div>
            <div className="flex gap-1 items-center">
              <svg
                width="5"
                height="5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              >
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto px-1 py-1 space-y-[3px]"
            style={{
              background:
                "linear-gradient(180deg, #0b141a 0%, #0d1a1f 100%)",
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

            {/* Day progress pill */}
            <div className="flex justify-center mb-0.5">
              <span
                className="rounded-full px-2 py-[1.5px] flex items-center gap-[2px]"
                style={{
                  fontSize: "0.16rem",
                  background: "rgba(37,211,102,0.1)",
                  color: "#25D366",
                  border: "1px solid rgba(37,211,102,0.15)",
                  fontWeight: 600,
                }}
              >
                🏋️ Día 3 de 21
              </span>
            </div>

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className="rounded-md max-w-[88%] relative overflow-hidden"
                  style={{
                    background:
                      msg.from === "user" ? "#005c4b" : "#1f2c34",
                    borderTopLeftRadius:
                      msg.from === "bot" ? "2px" : undefined,
                    borderTopRightRadius:
                      msg.from === "user" ? "2px" : undefined,
                  }}
                >
                  {msg.type === "video" ? (
                    /* Video message */
                    <div className="relative">
                      <img
                        src={typeof videoThumb === "string" ? videoThumb : videoThumb.src}
                        alt="Video rutina"
                        className="w-full object-cover"
                        style={{
                          height: "42px",
                          filter: "brightness(0.85)",
                        }}
                      />
                      {/* Play button overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: "14px",
                            height: "14px",
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <svg
                            width="7"
                            height="7"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                      {/* Video duration */}
                      <div
                        className="absolute bottom-[2px] left-[3px] flex items-center gap-[1.5px] rounded px-[2px] py-[0.5px]"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        <svg
                          width="3"
                          height="3"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span
                          className="text-white"
                          style={{ fontSize: "0.15rem", fontWeight: 500 }}
                        >
                          4:32
                        </span>
                      </div>
                      {/* Timestamp on video */}
                      <div
                        className="absolute bottom-[2px] right-[3px] flex items-center gap-[2px] rounded px-[2px] py-[0.5px]"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                        }}
                      >
                        <span
                          className="text-white/70"
                          style={{ fontSize: "0.14rem" }}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Text message */
                    <div className="px-1 py-[2px]">
                      <p
                        className="text-white/90"
                        style={{ fontSize: "0.22rem", lineHeight: 1.45 }}
                      >
                        {msg.text}
                      </p>
                      <div className="flex justify-end items-center gap-0.5 mt-px">
                        <span
                          className="text-white/30"
                          style={{ fontSize: "0.15rem" }}
                        >
                          {msg.time}
                        </span>
                        {msg.from === "user" && (
                          <svg
                            width="4"
                            height="4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#53bdeb"
                            strokeWidth="2.5"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-1 px-1 py-[3px]"
            style={{
              background: "#1f2c34",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <svg
              width="5"
              height="5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
            <div
              className="flex-1 rounded-full px-1.5 py-[2px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span
                className="text-white/25"
                style={{ fontSize: "0.2rem" }}
              >
                Mensaje
              </span>
            </div>
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: "10px",
                height: "10px",
                background: "#25D366",
              }}
            >
              <svg width="5" height="5" viewBox="0 0 24 24" fill="white">
                <path d="M12 2a10 10 0 00-3.16 19.5l-1.34 3.5 3.8-2a10 10 0 100-21z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div
          className="flex justify-center py-[2px]"
          style={{ background: "#111118" }}
        >
          <div
            className="rounded-full"
            style={{
              width: "24px",
              height: "2px",
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
