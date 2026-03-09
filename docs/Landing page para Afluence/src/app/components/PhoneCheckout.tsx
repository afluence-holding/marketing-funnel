export function PhoneCheckout() {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0a0a12 0%, #10081a 50%, #0a0f18 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "170px",
          height: "170px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)",
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
            "0 0 30px rgba(139,92,246,0.1), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
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
          style={{ background: "#0e0e16" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-2 py-1.5"
            style={{
              background: "linear-gradient(90deg, #0e0e16, #13101e)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg
              width="5"
              height="5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span
              className="text-white/80"
              style={{ fontSize: "0.28rem", fontWeight: 600 }}
            >
              Checkout
            </span>
            <svg
              width="5"
              height="5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-1.5">
            {/* Product card */}
            <div
              className="rounded-md p-1.5 flex gap-1.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Product image placeholder */}
              <div
                className="shrink-0 rounded flex items-center justify-center"
                style={{
                  width: "22px",
                  height: "22px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-white/90 truncate"
                  style={{ fontSize: "0.24rem", fontWeight: 600 }}
                >
                  Programa Premium 12 Sem.
                </p>
                <p
                  className="text-white/40"
                  style={{ fontSize: "0.18rem" }}
                >
                  Acceso completo + comunidad
                </p>
                <div className="flex items-center gap-1 mt-[2px]">
                  <span
                    className="text-white/30"
                    style={{
                      fontSize: "0.18rem",
                      textDecoration: "line-through",
                    }}
                  >
                    $197 USD
                  </span>
                  <span
                    className="text-white"
                    style={{ fontSize: "0.24rem", fontWeight: 700 }}
                  >
                    $97 USD
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER BUMP */}
            <div
              className="rounded-md overflow-hidden"
              style={{
                border: "1.5px solid rgba(251,191,36,0.5)",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,146,36,0.04) 100%)",
              }}
            >
              {/* Bump header */}
              <div
                className="px-1.5 py-[3px] flex items-center gap-1"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  borderBottom: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                <svg
                  width="5"
                  height="5"
                  viewBox="0 0 24 24"
                  fill="#fbbf24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span
                  style={{
                    fontSize: "0.2rem",
                    fontWeight: 700,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Oferta especial
                </span>
              </div>
              {/* Bump body */}
              <div className="px-1.5 py-1">
                <div className="flex items-start gap-1">
                  {/* Checkbox checked */}
                  <div
                    className="shrink-0 rounded-sm flex items-center justify-center mt-[1px]"
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "#fbbf24",
                      border: "1px solid #f59e0b",
                    }}
                  >
                    <svg
                      width="4"
                      height="4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="4"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-white/90"
                      style={{ fontSize: "0.2rem", fontWeight: 600 }}
                    >
                      ¡Sí! Agregar Pack de Plantillas
                    </p>
                    <p
                      className="text-white/45 mt-[1px]"
                      style={{ fontSize: "0.17rem", lineHeight: 1.4 }}
                    >
                      50+ plantillas editables de contenido, emails y ads.
                    </p>
                    <div className="flex items-center gap-1 mt-[2px]">
                      <span
                        className="text-white/30"
                        style={{
                          fontSize: "0.17rem",
                          textDecoration: "line-through",
                        }}
                      >
                        $47
                      </span>
                      <span
                        style={{
                          fontSize: "0.22rem",
                          fontWeight: 700,
                          color: "#fbbf24",
                        }}
                      >
                        $19 USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div
              className="rounded-md px-1.5 py-1"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex justify-between items-center mb-[2px]">
                <span
                  className="text-white/45"
                  style={{ fontSize: "0.18rem" }}
                >
                  Programa Premium
                </span>
                <span
                  className="text-white/70"
                  style={{ fontSize: "0.18rem" }}
                >
                  $97.00
                </span>
              </div>
              <div className="flex justify-between items-center mb-[2px]">
                <span
                  className="text-white/45"
                  style={{ fontSize: "0.18rem" }}
                >
                  Pack Plantillas
                </span>
                <span
                  style={{ fontSize: "0.18rem", color: "#fbbf24" }}
                >
                  $19.00
                </span>
              </div>
              <div
                className="flex justify-between items-center pt-[3px] mt-[3px]"
                style={{ borderTop: "1px dashed rgba(255,255,255,0.08)" }}
              >
                <span
                  className="text-white/80"
                  style={{ fontSize: "0.22rem", fontWeight: 700 }}
                >
                  Total
                </span>
                <span
                  className="text-white"
                  style={{ fontSize: "0.26rem", fontWeight: 700 }}
                >
                  $116.00
                </span>
              </div>
            </div>

            {/* Card input fields */}
            <div className="space-y-1">
              {/* Card number */}
              <div
                className="rounded-md px-1.5 py-[4px] flex items-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <svg
                  width="6"
                  height="6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span
                  className="text-white/25"
                  style={{ fontSize: "0.19rem" }}
                >
                  4242 •••• •••• ••••
                </span>
                <div className="ml-auto flex gap-[2px]">
                  {/* Visa logo mini */}
                  <div
                    className="rounded-[1px] flex items-center justify-center"
                    style={{
                      width: "8px",
                      height: "5px",
                      background: "#1a1f71",
                    }}
                  >
                    <span
                      className="text-white"
                      style={{
                        fontSize: "0.14rem",
                        fontWeight: 700,
                        fontStyle: "italic",
                      }}
                    >
                      V
                    </span>
                  </div>
                  {/* MC logo mini */}
                  <div
                    className="rounded-[1px] flex items-center justify-center"
                    style={{
                      width: "8px",
                      height: "5px",
                      background: "#333",
                    }}
                  >
                    <div className="flex">
                      <div
                        className="rounded-full"
                        style={{
                          width: "2.5px",
                          height: "2.5px",
                          background: "#eb001b",
                          marginRight: "-1px",
                        }}
                      />
                      <div
                        className="rounded-full"
                        style={{
                          width: "2.5px",
                          height: "2.5px",
                          background: "#f79e1b",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Row: expiry + cvv */}
              <div className="flex gap-1">
                <div
                  className="flex-1 rounded-md px-1.5 py-[4px]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="text-white/25"
                    style={{ fontSize: "0.19rem" }}
                  >
                    MM / AA
                  </span>
                </div>
                <div
                  className="flex-1 rounded-md px-1.5 py-[4px]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="text-white/25"
                    style={{ fontSize: "0.19rem" }}
                  >
                    CVC
                  </span>
                </div>
              </div>
            </div>

            {/* Pay button */}
            <div
              className="rounded-md py-[5px] flex items-center justify-center gap-1"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
              }}
            >
              <svg
                width="5"
                height="5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span
                className="text-white"
                style={{ fontSize: "0.24rem", fontWeight: 700 }}
              >
                Pagar $116.00 USD
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-2 pt-[2px] pb-1">
              <div className="flex items-center gap-[2px]">
                <svg
                  width="4"
                  height="4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span
                  className="text-white/25"
                  style={{ fontSize: "0.15rem" }}
                >
                  SSL Seguro
                </span>
              </div>
              <div className="flex items-center gap-[2px]">
                <svg
                  width="4"
                  height="4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span
                  className="text-white/25"
                  style={{ fontSize: "0.15rem" }}
                >
                  Garantía 7 días
                </span>
              </div>
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
