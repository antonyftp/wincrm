import type { AcquisitionPoint } from "@/app/actions/dashboard";

type Props = { data: AcquisitionPoint[] };

export default function LeadsAcquisitionChart({ data }: Props) {
  const w = 800;
  const h = 220;
  const pad = { l: 36, r: 16, t: 12, b: 28 };
  const values = data.map((d) => d.count);
  const rawMax = Math.max(...values, 1);
  const max = rawMax * 1.15;
  const total = values.reduce((s, v) => s + v, 0);

  const px = (i: number) =>
    data.length > 1
      ? pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r)
      : pad.l + (w - pad.l - pad.r) / 2;
  const py = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);

  const pathD = values.map((v, i) => `${i ? "L" : "M"} ${px(i)} ${py(v)}`).join(" ");
  const areaD = `${pathD} L ${px(values.length - 1)} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`;
  const ticks = [0, Math.round(rawMax / 2), rawMax];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>12 derniers mois</span>
        <span className="badge pos"><span className="dot" />{total} leads</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 240 }}>
        <defs>
          <linearGradient id="lg-acq" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.l} x2={w - pad.r}
              y1={py(t)} y2={py(t)}
              stroke="var(--border)" strokeDasharray="3 3"
            />
            <text x={pad.l - 8} y={py(t) + 4} fill="var(--text-faint)" fontSize="11" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <path d={areaD} fill="url(#lg-acq)" />
        <path d={pathD} stroke="var(--accent)" strokeWidth="2.5" fill="none" />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={px(i)} cy={py(v)}
            r="3.5"
            fill="var(--surface)"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        ))}
        {data.map((d, i) => (
          <text key={i} x={px(i)} y={h - 8} fill="var(--text-faint)" fontSize="11" textAnchor="middle">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
