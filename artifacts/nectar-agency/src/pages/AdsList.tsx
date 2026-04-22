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
  getGetMarketplaceFeedQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CategoryDropdown } from "@/components/forms/CategoryDropdown";
import {
  Plus,
  Trash2,
  Eye,
  MousePointerClick,
  X,
  Rocket,
  ImageIcon,
  Type,
  AlignLeft,
  LinkIcon,
} from "lucide-react";

export function AdsList() {
  const qc = useQueryClient();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: ads } = useListAds({ query: { queryKey: getListAdsQueryKey() } });
  const createAd = useCreateAd();
  const deleteAd = useDeleteAd();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    link: string;
    imageUrl: string;
    category: string | null;
  }>({ title: "", description: "", link: "", imageUrl: "", category: null });
  const [error, setError] = useState<string | null>(null);

  const adsCount = ads?.length ?? 0;
  const limit = me?.adsLimit ?? 1;
  const reachedLimit = adsCount >= limit;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createAd.mutate(
      {
        data: {
          title: form.title,
          description: form.description,
          link: form.link,
          imageUrl: form.imageUrl.trim() || null,
          category: form.category,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListAdsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          qc.invalidateQueries({ queryKey: getGetMarketplaceFeedQueryKey() });
          setOpen(false);
          setForm({
            title: "",
            description: "",
            link: "",
            imageUrl: "",
            category: null,
          });
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
          qc.invalidateQueries({ queryKey: getGetMarketplaceFeedQueryKey() });
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
        <div
          className="fixed inset-0 z-50 grid place-items-start sm:place-items-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg my-auto bg-white text-zinc-900 rounded-2xl shadow-2xl ring-1 ring-yellow-300/40 overflow-hidden float-up"
            data-testid="modal-create-ad"
          >
            {/* Header */}
            <div className="relative px-6 sm:px-8 pt-7 pb-5 border-b border-zinc-100">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-lg text-zinc-500 hover:bg-yellow-50 hover:text-zinc-900 transition"
                  aria-label="Fechar"
                  data-testid="button-close-modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br from-yellow-400 to-orange-400 text-zinc-900 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.6)]">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black text-zinc-900">
                    Novo anúncio
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Preencha os dados para começar a receber tráfego.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={submit} className="px-6 sm:px-8 py-6 space-y-5">
              <LightField
                label="Título"
                icon={Type}
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Ex: Curso completo de marketing digital"
                testId="input-title"
                maxLength={120}
              />
              <LightField
                label="Descrição"
                icon={AlignLeft}
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="Descreva sua oferta de forma persuasiva"
                testId="input-description"
                maxLength={500}
                textarea
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  <Tag /> Categoria
                </div>
                <CategoryDropdown
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  placeholder="Selecionar categoria"
                  variant="light"
                  testId="form-category"
                />
              </div>
              <LightField
                label="Imagem (URL)"
                icon={ImageIcon}
                value={form.imageUrl}
                onChange={(v) => setForm({ ...form, imageUrl: v })}
                placeholder="https://exemplo.com/imagem.jpg (opcional)"
                testId="input-image"
              />
              <LightField
                label="Link"
                icon={LinkIcon}
                value={form.link}
                onChange={(v) => setForm({ ...form, link: v })}
                placeholder="https://seusite.com/oferta"
                testId="input-link"
              />

              {error && (
                <div className="text-sm px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  createAd.isPending ||
                  !form.title ||
                  !form.description ||
                  !form.link
                }
                data-testid="button-submit-ad"
                className="group relative overflow-hidden w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-black text-sm shadow-[0_10px_28px_-6px_rgba(255,180,0,0.55)] hover:shadow-[0_14px_38px_-4px_rgba(255,180,0,0.75)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                <Rocket className="h-4 w-4 relative z-10" />
                <span className="relative z-10">
                  {createAd.isPending ? "Publicando..." : "Publicar anúncio"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Tag() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LightField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  testId,
  maxLength,
  textarea,
}: {
  label: string;
  icon?: typeof Type;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  testId?: string;
  maxLength?: number;
  textarea?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          data-testid={testId}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-yellow-400 focus:shadow-[0_0_0_4px_rgba(255,215,0,0.18)] resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          data-testid={testId}
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-yellow-400 focus:shadow-[0_0_0_4px_rgba(255,215,0,0.18)]"
        />
      )}
    </div>
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
