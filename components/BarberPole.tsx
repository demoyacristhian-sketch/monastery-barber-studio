export default function BarberPole({
  height = 240,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const W = 22;        // cylinder width
  const GD = 20;       // globe diameter
  const CAP_W = 30;
  const BASE_W = 38;
  const CAP_H = 8;
  const BASE_H = 12;
  const totalH = GD + CAP_H + height + CAP_H + BASE_H;
  const cx = BASE_W / 2;

  // Y positions
  const globeY = GD / 2;
  const topCapY = GD;
  const cylY = topCapY + CAP_H;
  const botCapY = cylY + height;
  const baseY = botCapY + CAP_H;

  const cylX = (BASE_W - W) / 2;
  const capX = (BASE_W - CAP_W) / 2;

  return (
    <svg
      width={BASE_W}
      height={totalH}
      viewBox={`0 0 ${BASE_W} ${totalH}`}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Strong 3D cylinder sheen — key to making it look round */}
        <linearGradient id="bp-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.92)" />
          <stop offset="14%"  stopColor="rgba(0,0,0,0.28)" />
          <stop offset="36%"  stopColor="rgba(255,248,230,0.82)" />
          <stop offset="50%"  stopColor="rgba(255,248,230,0.16)" />
          <stop offset="68%"  stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.88)" />
        </linearGradient>

        {/* Dark bronze / gunmetal chrome */}
        <linearGradient id="bp-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#4a4438" />
          <stop offset="22%"  stopColor="#2a2520" />
          <stop offset="50%"  stopColor="#161310" />
          <stop offset="78%"  stopColor="#2e2922" />
          <stop offset="100%" stopColor="#3e3830" />
        </linearGradient>

        {/* Frosted glass globe */}
        <radialGradient id="bp-globe" cx="34%" cy="29%" r="68%">
          <stop offset="0%"   stopColor="rgba(255,252,235,0.95)" />
          <stop offset="28%"  stopColor="rgba(200,192,168,0.80)" />
          <stop offset="62%"  stopColor="rgba(110,104,88,0.75)" />
          <stop offset="100%" stopColor="rgba(28,25,18,0.96)" />
        </radialGradient>

        {/* Clip for cylinder */}
        <clipPath id="bp-clip">
          <rect x={cylX} y={cylY} width={W} height={height} />
        </clipPath>
      </defs>

      {/* Soft ground shadow */}
      <ellipse
        cx={cx} cy={totalH - 1}
        rx={BASE_W / 2 - 1} ry={4}
        fill="rgba(0,0,0,0.55)"
        style={{ filter: "blur(3px)" }}
      />

      {/* ── GLOBE ── */}
      <circle cx={cx} cy={globeY} r={GD / 2} fill="url(#bp-globe)" />
      {/* Specular highlight */}
      <ellipse
        cx={cx - 4} cy={globeY - 4}
        rx={3.5} ry={2}
        fill="rgba(255,252,235,0.62)"
        transform={`rotate(-22 ${cx - 4} ${globeY - 4})`}
      />

      {/* ── TOP CAP ── */}
      <rect x={capX} y={topCapY} width={CAP_W} height={CAP_H} rx={2.5} fill="url(#bp-chrome)" />
      {/* Gold accent line */}
      <rect x={capX + 1} y={topCapY + 1} width={CAP_W - 2} height={1} rx={0.5}
        fill="rgba(201,168,76,0.28)" />

      {/* ── CYLINDER STRIPES (CSS-animated) ── */}
      <g clipPath="url(#bp-clip)">
        <foreignObject x={cylX} y={cylY} width={W} height={height}>
          <div
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            xmlns="http://www.w3.org/1999/xhtml"
            className="barber-pole-stripes"
            style={{ width: "100%", height: "100%" }}
          />
        </foreignObject>
      </g>

      {/* ── 3D SHEEN OVER STRIPES ── */}
      <rect
        x={cylX} y={cylY} width={W} height={height}
        fill="url(#bp-sheen)"
        clipPath="url(#bp-clip)"
      />

      {/* ── BOTTOM CAP ── */}
      <rect x={capX} y={botCapY} width={CAP_W} height={CAP_H} rx={2.5} fill="url(#bp-chrome)" />
      <rect x={capX + 1} y={botCapY + CAP_H - 2} width={CAP_W - 2} height={1} rx={0.5}
        fill="rgba(201,168,76,0.18)" />

      {/* ── BASE ── */}
      <rect x={0} y={baseY} width={BASE_W} height={BASE_H} rx={4} fill="url(#bp-chrome)" />
      <rect x={2} y={baseY + 1} width={BASE_W - 4} height={1.5} rx={1}
        fill="rgba(201,168,76,0.22)" />
    </svg>
  );
}
