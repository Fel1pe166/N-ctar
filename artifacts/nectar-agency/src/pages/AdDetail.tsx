import { useParams, Link } from "wouter";
import {
  useGetAd,
  getGetAdQueryKey,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ArrowLeft, Eye, MousePointerClick, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export function AdDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: ad } = useGetAd(id, {
    query: { enabled: !!id, queryKey: getGetAdQueryKey(id) },
  });
  const [copied, setCopied] = useState(false);

  if (!ad) {
    return (
      <DashboardShell>
        <div className="text-muted-foreground">Carregando...</div>
      </DashboardShell>
    );
  }

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const publicUrl = `${window.location.origin}${basePath}/a/${ad.id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <DashboardShell>
      <Link
        href="/ads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para anúncios
      </Link>

      <div className="card-neon card-neon-hover p-8">
        <h1 className="font-display text-3xl md:text-4xl font-black">{ad.title}</h1>
        <p className="mt-3 text-foreground/80 text-lg leading-relaxed">{ad.description}</p>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Big label="Visualizações" value={ad.views} icon={Eye} />
          <Big label="Cliques" value={ad.clicks} icon={MousePointerClick} />
          <Big label="CTR" value={`${(ad.ctr * 100).toFixed(2)}%`} primary />
        </div>

        <div className="mt-8 p-5 rounded-xl bg-muted/40 border border-primary/15">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Link público para divulgar
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 text-sm font-mono px-3 py-2.5 rounded-lg bg-background border border-primary/10 truncate">
              {publicUrl}
            </code>
            <button
              onClick={copy}
              data-testid="button-copy-link"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/40 hover:bg-primary/10 text-sm font-semibold neon-btn"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <a
              href={`${basePath}/a/${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-open-public"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold neon-btn neon-glow"
            >
              <ExternalLink className="h-4 w-4" /> Visualizar
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Big({
  label,
  value,
  icon: Icon,
  primary,
}: {
  label: string;
  value: string | number;
  icon?: typeof Eye;
  primary?: boolean;
}) {
  return (
    <div className="rounded-xl border border-primary/15 bg-muted/30 px-5 py-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className={`mt-1 font-display font-black text-3xl ${primary ? "neon-text" : ""}`}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
    </div>
  );
}
