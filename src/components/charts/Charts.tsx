import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, currency } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "var(--color-faint)" };
const GRID_STROKE = "var(--color-line)";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-pop)",
  fontSize: 12,
  padding: "8px 10px",
};

const CHART_COLORS = [
  "var(--color-primary)",
  "#2563EB",
  "#7C3AED",
  "#B45309",
  "#0891B2",
  "#65A30D",
];

/* ---- Área de tendência (receita x despesa) ------------------------ */
export function TrendArea({
  data,
  keys,
}: {
  data: Record<string, number | string>[];
  keys: { key: string; label: string; color?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k.key} id={`grad-${k.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={k.color ?? CHART_COLORS[i]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={k.color ?? CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis dataKey="mes" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactCurrency(Number(v))} width={64} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number, n: string) => [currency(v), keys.find((k) => k.key === n)?.label ?? n]}
        />
        {keys.map((k, i) => (
          <Area
            key={k.key}
            type="monotone"
            dataKey={k.key}
            stroke={k.color ?? CHART_COLORS[i]}
            strokeWidth={2}
            fill={`url(#grad-${k.key})`}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---- Barras horizontais (ranking) ------------------------------- */
export function RankBars({
  data,
  height = 220,
}: {
  data: { nome: string; valor: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nome"
          tick={{ ...AXIS, fill: "var(--color-muted)" }}
          tickLine={false}
          axisLine={false}
          width={112}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [currency(v), "Faturamento"]} cursor={{ fill: "var(--color-surface-2)" }} />
        <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---- Barras verticais simples --------------------------------- */
export function MiniBars({
  data,
  xKey,
  yKey,
  height = 180,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  yKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactCurrency(Number(v))} width={56} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [currency(v), "Valor"]} cursor={{ fill: "var(--color-surface-2)" }} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} barSize={26} fill="var(--color-primary)" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---- Donut de composição ------------------------------------- */
export function BreakdownDonut({
  data,
  height = 200,
}: {
  data: { nome: string; valor: number }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={height} height={height}>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="nome" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [currency(v), "Faturamento"]} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={d.nome} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              {d.nome}
            </span>
            <span className="font-medium text-ink">{Math.round((d.valor / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
