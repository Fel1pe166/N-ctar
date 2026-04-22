import { useState } from "react";
import { Link } from "wouter";
import {
  useListAds,
  getListAdsQueryKey,
  useCreateAd,
  useDeleteAd,
  useGetMe,
  getGetMeQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Plus,
  Trash2,
  Eye,
  MousePointerClick,
  X,
  ExternalLink,
} from "lucide-react";

export function AdsList() {
  const qc = useQueryClient();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: ads } = useListAds({ query: { queryKey: getListAdsQueryKey() } });
  const createAd = useCreateAd();
  const deleteAd = useDeleteAd();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", link: "" });
  const [error, setError] = useState<string | null>(null);

  const adsCount = ads?.length ?? 0;
  const limit = me?.adsLimit ?? 1;
  const reachedLimit = adsCount >= limit;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createAd.mutate(
      { data: form },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListAdsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setOpen(false);
          setForm({ title: "", description: "", link: "" });
        },
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { error?: string } } };
          setError(e?.response?.data?.error ?? "Erro ao criar anúncio.");
        },
      },
    );
  };

  const remove = (id: string) => {
    if (!confirm("Remover este anúncio?")) return;
    deleteAd.mutate(
      { id },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListAdsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
      },
    );
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold tracking-[0.25em] text-primary">ANÚNCIOS</div>
          <h1 className="font-display text-3xl md:text-4xl font-black mt-1">Seus anúncios</h1>
          <p className="text-foreground/70 mt-1.5">
            {adsCount} de {limit >= 9999 ? "ilimitados" : limit} anúncios usados.
          </p>
        </div>
        <button
          onClick={() => {
            if (reachedLimit) {
              setError(
                "Você atingiu o limite do seu plano. Faça upgrade para criar mais anúncios.",
              );
              return;
            }
            setError(null);
            setOpen(true);
          }}
          data-testid="button-open-create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow neon-btn"
        >
          <Plus className="h-4 w-4" /> Criar anúncio
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive-foreground text-sm">
          {error}
        </div>
      )}

      {!ads || ads.length === 0 ? (
        <div className="card-neon p-12 text-center">
          <p className="text-muted-foreground">
            Nenhum anúncio criado ainda. Comece agora e veja seus números crescerem.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {ads.map((a) => (
            <div
              key={a.id}
              className="card-neon card-neon-hover p-5"
              data-testid={`ad-card-${a.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/ads/${a.id}`} className="min-w-0 flex-1">
                  <h3 className="font-bold truncate hover:text-primary transition">
                    {a.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {a.description}
                  </p>
                </Link>
                <button
                  onClick={() => remove(a.id)}
                  data-testid={`button-delete-${a.id}`}
                  className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat icon={Eye} label="Views" value={a.views} />
                <Stat icon={MousePointerClick} label="Cliques" value={a.clicks} />
                <Stat label="CTR" value={`${(a.ctr * 100).toFixed(1)}%`} highlight />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card-neon card-neon-hover w-full max-w-md p-6 relative float-up">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-display text-xl font-bold mb-1">Novo anúncio</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Preencha os dados para começar a receber tráfego.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <Field
                label="Título"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Ex: Curso completo de marketing digital"
                testId="input-title"
                maxLength={120}
              />
              <Field
                label="Descrição"
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="Descreva sua oferta de forma persuasiva"
                testId="input-description"
                maxLength={500}
                textarea
              />
              <Field
                label="Link"
                value={form.link}
                onChange={(v) => setForm({ ...form, link: v })}
                placeholder="https://seusite.com/oferta"
                testId="input-link"
              />
              <button
                type="submit"
                disabled={createAd.isPending || !form.title || !form.description || !form.link}
                data-testid="button-submit-ad"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold neon-glow neon-btn disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createAd.isPending ? "Criando..." : "Publicar anúncio"}
                <ExternalLink className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon?: typeof Eye;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/40 border border-primary/10 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 justify-center">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className={`mt-0.5 font-display font-bold ${highlight ? "text-primary" : ""}`}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  testId,
  maxLength,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  testId?: string;
  maxLength?: number;
  textarea?: boolean;
}) {
  const cls =
    "w-full bg-muted/60 border border-primary/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition";
  return (
    <label className="block">
      <div className="text-xs font-semibold text-foreground/80 mb-1.5">{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          data-testid={testId}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          data-testid={testId}
          className={cls}
        />
      )}
    </label>
  );
}
