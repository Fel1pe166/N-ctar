import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useGetDashboardTimeseries,
  getGetDashboardTimeseriesQueryKey,
  useListAds,
  getListAdsQueryKey,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Link } from "wouter";
import {
  Eye,
  MousePointerClick,
  Percent,
  Megaphone,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function Dashboard() {
  const { data: summary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: series } = useGetDashboardTimeseries({
    query: { queryKey: getGetDashboardTimeseriesQueryKey() },
  });
  const { data: ads } = useListAds({
    query: { queryKey: getListAdsQueryKey() },
  });

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold tracking-[0.25em] text-primary">PAINEL</div>
          <h1 className="font-display text-3xl md:text-4xl font-black mt-1">
            Bem-vindo de volta
          </h1>
          <p className="text-foreground/70 mt-1.5">
            Sua performance em tempo real. Plano atual:{" "}
            <span className="text-primary font-semibold capitalize">
              {summary?.plan ?? "free"}
            </span>
          </p>
        </div>
        <Link
          href="/ads"
          data-testid="button-create-ad-cta"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow neon-btn"
        >
          <Plus className="h-4 w-4" />
          Criar anúncio
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Eye}
          label="Visualizações"
          value={summary?.totalViews ?? 0}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Cliques"
          value={summary?.totalClicks ?? 0}
        />
        <MetricCard
          icon={Percent}
          label="CTR"
          value={`${((summary?.ctr ?? 0) * 100).toFixed(1)}%`}
          isText
        />
        <MetricCard
          icon={Megaphone}
          label="Total de anúncios"
          value={`${summary?.totalAds ?? 0}/${
            summary && summary.adsLimit >= 9999 ? "∞" : summary?.adsLimit ?? 0
          }`}
          isText
        />
      </div>

      <div className="mt-8 card-neon card-neon-hover p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold">Performance · 14 dias</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visualizações vs cliques
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Legend color="#FFD700" label="Views" />
            <Legend color="#ffffff" label="Cliques" />
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series ?? []}>
              <defs>
                <linearGradient id="gV" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gC" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                tickFormatter={(d) => d.slice(5)}
                stroke="rgba(255,215,0,0.15)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                stroke="rgba(255,215,0,0.15)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,215,0,0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#FFD700" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#FFD700"
                fill="url(#gV)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#ffffff"
                fill="url(#gC)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Seus anúncios recentes</h2>
          <Link
            href="/ads"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {!ads || ads.length === 0 ? (
          <div className="card-neon p-10 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem anúncios. Crie o primeiro e comece a receber tráfego.
            </p>
            <Link
              href="/ads"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold neon-btn neon-glow"
            >
              <Plus className="h-4 w-4" /> Criar anúncio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {ads.slice(0, 4).map((a) => (
              <Link
                key={a.id}
                href={`/ads/${a.id}`}
                className="card-neon card-neon-hover p-5 hover:-translate-y-0.5 transition-transform"
                data-testid={`ad-row-${a.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{a.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {a.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-primary flex-none" />
                </div>
                <div className="mt-4 flex items-center gap-5 text-xs">
                  <span className="text-muted-foreground">
                    <Eye className="inline h-3 w-3 mr-1" />
                    {a.views}
                  </span>
                  <span className="text-muted-foreground">
                    <MousePointerClick className="inline h-3 w-3 mr-1" />
                    {a.clicks}
                  </span>
                  <span className="text-primary font-semibold">
                    CTR {(a.ctr * 100).toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  isText,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  isText?: boolean;
}) {
  return (
    <div
      className="card-neon card-neon-hover p-5 group hover:-translate-y-0.5 transition-transform"
      data-testid={`metric-${label}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted-foreground tracking-wider uppercase">
          {label}
        </div>
        <div className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center text-primary neon-glow-soft">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`font-display font-black ${isText ? "text-2xl" : "text-3xl neon-text"}`}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
