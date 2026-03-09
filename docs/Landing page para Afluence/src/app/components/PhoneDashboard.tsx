export function PhoneDashboard() {
  // Mini bar chart data (7 days)
  const barData = [65, 45, 80, 55, 90, 72, 95];
  const barDays = ["L", "M", "X", "J", "V", "S", "D"];

  // Area chart points (smooth revenue curve)
  const areaPoints = [20, 35, 28, 50, 42, 68, 60, 78, 72, 88, 82, 95];

  // Build SVG path for area chart
  const areaW = 200;
  const areaH = 36;
  const stepX = areaW / (areaPoints.length - 1);
  const pathD = areaPoints
    .map((v, i) => {
      const x = i * stepX;
      const y = areaH - (v / 100) * areaH;
      return i === 0 ? `M${x},${y}` : `L${x},${y}`;
    })
    .join(" ");
  const areaD = `${pathD} L${areaW},${areaH} L0,${areaH} Z`;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #0a0a14 0%, #080d18 50%, #0c0a16 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "200px",
          height: "200px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(99,179,237,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
          filter: "blur(14px)",
        }}
      />

      {/* Browser window */}
      <div
        className="relative flex flex-col"
        style={{
          width: "220px",
          height: "152px",
          borderRadius: "8px",
          border: "1.5px solid rgba(255,255,255,0.12)",
          background: "#111118",
          boxShadow:
            "0 0 30px rgba(99,179,237,0.08), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Browser title bar */}
        <div
          className="flex items-center px-2 py-[4px] shrink-0"
          style={{
            background: "#1a1a24",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Traffic lights */}
          <div className="flex gap-[3px] mr-2">
            <div
              className="rounded-full"
              style={{ width: "5px", height: "5px", background: "#ff5f57" }}
            />
            <div
              className="rounded-full"
              style={{ width: "5px", height: "5px", background: "#febc2e" }}
            />
            <div
              className="rounded-full"
              style={{ width: "5px", height: "5px", background: "#28c840" }}
            />
          </div>
          {/* URL bar */}
          <div
            className="flex-1 flex items-center gap-1 rounded px-2 py-[1.5px]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
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
            <span
              className="text-white/30"
              style={{ fontSize: "0.16rem" }}
            >
              app.afluence.io/dashboard
            </span>
          </div>
        </div>

        {/* Browser content */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #0f1219 0%, #13161f 100%)",
          }}
        >
          {/* Sidebar */}
          <div
            className="shrink-0 flex flex-col py-1.5 px-1"
            style={{
              width: "36px",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {/* Logo */}
            <div
              className="rounded-md flex items-center justify-center mb-2 mx-auto"
              style={{
                width: "14px",
                height: "14px",
                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              }}
            >
              <span
                className="text-white"
                style={{ fontSize: "0.2rem", fontWeight: 800 }}
              >
                A
              </span>
            </div>
            {/* Nav items */}
            {[
              { active: true, icon: "home" },
              { active: false, icon: "chart" },
              { active: false, icon: "users" },
              { active: false, icon: "settings" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-md flex items-center justify-center mb-[3px] mx-auto"
                style={{
                  width: "16px",
                  height: "16px",
                  background: item.active
                    ? "rgba(139,92,246,0.15)"
                    : "transparent",
                  border: item.active
                    ? "1px solid rgba(139,92,246,0.2)"
                    : "1px solid transparent",
                }}
              >
                {item.icon === "home" && (
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={item.active ? "#8B5CF6" : "rgba(255,255,255,0.25)"}
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                )}
                {item.icon === "chart" && (
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                  >
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                )}
                {item.icon === "users" && (
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                )}
                {item.icon === "settings" && (
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col px-2 py-1.5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p
                  className="text-white/40"
                  style={{ fontSize: "0.15rem" }}
                >
                  Buenos días 👋
                </p>
                <p
                  className="text-white"
                  style={{ fontSize: "0.26rem", fontWeight: 700 }}
                >
                  Tu Dashboard
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="rounded-md px-1.5 py-[2px] flex items-center gap-[3px]"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <svg
                    width="5"
                    height="5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span
                    className="text-[#8B5CF6]"
                    style={{ fontSize: "0.14rem", fontWeight: 600 }}
                  >
                    Nuevo
                  </span>
                </div>
                <div
                  className="rounded-full"
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      fontSize: "0.17rem",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    A
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-[4px] mb-1.5">
              {[
                {
                  label: "Ingresos",
                  value: "$47.8K",
                  change: "+24%",
                  color: "#34D399",
                  bg: "rgba(52,211,153,0.06)",
                },
                {
                  label: "Leads",
                  value: "1,284",
                  change: "+18%",
                  color: "#60A5FA",
                  bg: "rgba(96,165,250,0.06)",
                },
                {
                  label: "Conversión",
                  value: "8.4%",
                  change: "+3.2%",
                  color: "#C084FC",
                  bg: "rgba(192,132,252,0.06)",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-md px-1.5 py-1"
                  style={{
                    background: stat.bg,
                    border: `1px solid ${stat.color}12`,
                  }}
                >
                  <p
                    className="text-white/35"
                    style={{ fontSize: "0.12rem" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-white"
                    style={{ fontSize: "0.24rem", fontWeight: 700 }}
                  >
                    {stat.value}
                  </p>
                  <span
                    style={{
                      fontSize: "0.11rem",
                      color: stat.color,
                      fontWeight: 600,
                    }}
                  >
                    ↑ {stat.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="flex gap-[4px] flex-1 min-h-0">
              {/* Area chart */}
              <div
                className="flex-[3] rounded-md px-1.5 py-1 flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="text-white/60"
                    style={{ fontSize: "0.14rem", fontWeight: 600 }}
                  >
                    Ingresos mensuales
                  </p>
                  <span
                    className="rounded-full px-1 py-px"
                    style={{
                      fontSize: "0.1rem",
                      background: "rgba(52,211,153,0.1)",
                      color: "#34D399",
                      fontWeight: 600,
                    }}
                  >
                    12 meses
                  </span>
                </div>
                <div className="flex-1 flex items-end">
                  <svg
                    viewBox={`0 0 ${areaW} ${areaH}`}
                    className="w-full"
                    style={{ height: "100%", maxHeight: "36px" }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="dashAreaGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8B5CF6"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#8B5CF6"
                          stopOpacity="0.02"
                        />
                      </linearGradient>
                      <linearGradient
                        id="dashLineGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#dashAreaGrad)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#dashLineGrad)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={areaW}
                      cy={
                        areaH -
                        (areaPoints[areaPoints.length - 1] / 100) * areaH
                      }
                      r="2"
                      fill="#EC4899"
                    />
                    <circle
                      cx={areaW}
                      cy={
                        areaH -
                        (areaPoints[areaPoints.length - 1] / 100) * areaH
                      }
                      r="4"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="0.6"
                      opacity="0.4"
                    />
                  </svg>
                </div>
              </div>

              {/* Bar chart */}
              <div
                className="flex-[2] rounded-md px-1.5 py-1 flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="text-white/60"
                    style={{ fontSize: "0.14rem", fontWeight: 600 }}
                  >
                    Usuarios
                  </p>
                  <span
                    className="text-white/25"
                    style={{ fontSize: "0.1rem" }}
                  >
                    7 días
                  </span>
                </div>
                <div
                  className="flex items-end gap-[3px] flex-1"
                >
                  {barData.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-[1px] h-full justify-end"
                    >
                      <div
                        className="w-full"
                        style={{
                          height: `${(val / 100) * 80}%`,
                          background:
                            idx === barData.length - 1
                              ? "linear-gradient(180deg, #60A5FA, #3B82F6)"
                              : "linear-gradient(180deg, rgba(96,165,250,0.5), rgba(59,130,246,0.2))",
                          borderRadius: "2px 2px 0 0",
                        }}
                      />
                      <span
                        className="text-white/20"
                        style={{ fontSize: "0.09rem" }}
                      >
                        {barDays[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom activity row */}
            <div className="flex gap-[4px] mt-1.5">
              {[
                {
                  icon: "💰",
                  text: "Nuevo pago recibido",
                  sub: "$2,450 · Premium",
                  color: "#34D399",
                },
                {
                  icon: "👤",
                  text: "Lead calificado",
                  sub: "Carlos M. · México",
                  color: "#60A5FA",
                },
                {
                  icon: "🚀",
                  text: "Campaña lanzada",
                  sub: "Reto 21 Días",
                  color: "#C084FC",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex items-center gap-[3px] rounded-md px-1 py-[3px]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.17rem" }}>{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white/70 truncate"
                      style={{ fontSize: "0.12rem", fontWeight: 500 }}
                    >
                      {item.text}
                    </p>
                    <p
                      className="truncate"
                      style={{ fontSize: "0.1rem", color: item.color }}
                    >
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
