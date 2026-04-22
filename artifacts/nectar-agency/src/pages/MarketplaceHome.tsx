import { useState } from "react";
import { Link } from "wouter";
import { SignInButton, SignUpButton, useUser } from "@clerk/react";
import {
  useGetMarketplaceFeed,
  getGetMarketplaceFeedQueryKey,
} from "@workspace/api-client-react";
import { Particles } from "@/components/effects/Particles";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { CategoryDropdown } from "@/components/forms/CategoryDropdown";
import { CATEGORIES } from "@/lib/categories";
import {
  Eye,
  MousePointerClick,
  Menu,
  Search,
  ArrowRight,
  Sparkles,
  Tag,
  X,
  LayoutGrid,
  ImageIcon,
  Plus,
} from "lucide-react";

export function MarketplaceHome() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { isSignedIn } = useUser();

  const { data: ads, isLoading } = useGetMarketplaceFeed(
    category ? { category } : undefined,
    {
      query: {
        queryKey: getGetMarketplaceFeedQueryKey(
          category ? { category } : undefined,
        ),
      },
    },
  );

  const filtered = (ads ?? []).filter((ad) =>
    search.trim()
      ? `${ad.title} ${ad.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : true,
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Top nav */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 flex-none">
          <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
            <span className="font-display font-black text-primary text-lg">N</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-sm font-bold tracking-widest">NÉCTAR</div>
            <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/80 ml-4">
          <Link href="/" className="text-primary font-semibold">Início</Link>
          <Link href="/plans" className="hover:text-primary transition">Planos VIP</Link>
          {isSignedIn && (
            <Link href="/dashboard" className="hover:text-primary transition">
              Minha Conta
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          {isSignedIn ? (
            <Link
              href="/ads"
              data-testid="button-create-ad-header"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.55)] hover:scale-[1.03] transition-all"
            >
              <Plus className="h-4 w-4" /> Criar anúncio
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  data-testid="button-signin-header"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold rounded-lg border border-primary/30 hover:bg-primary/10 hover:border-primary/60 transition"
                >
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  data-testid="button-signup-header"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.55)] hover:scale-[1.03] transition-all"
                >
                  Criar conta
                </button>
              </SignUpButton>
            </>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            data-testid="button-open-drawer"
            className="md:hidden h-10 w-10 grid place-items-center rounded-lg border border-primary/30 hover:bg-primary/10 transition"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Hero strip */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <Particles density={45} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary mb-5 neon-glow-soft">
            <Sparkles className="h-3.5 w-3.5" />
            Marketplace de divulgação
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Descubra <span className="neon-text">anúncios</span> em alta
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-foreground/70">
            Explore ofertas reais publicadas pela comunidade Néctar e divulgue a sua para milhares de visitantes.
          </p>

          {/* Search + filter bar */}
          <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar anúncios por título ou descrição..."
                data-testid="input-search"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/80 border border-yellow-500/15 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/15 text-sm placeholder:text-zinc-500 outline-none transition-all"
              />
            </div>
            <div className="sm:w-64">
              <CategoryDropdown
                value={category}
                onChange={(v) => setCategory(v === category ? null : v)}
                placeholder="Todas as categorias"
                variant="dark"
                testId="filter-category"
              />
            </div>
            {category && (
              <button
                onClick={() => setCategory(null)}
                data-testid="button-clear-category"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-yellow-500/25 text-sm font-semibold text-yellow-300 hover:bg-yellow-400/10 transition"
              >
                <X className="h-4 w-4" /> Limpar
              </button>
            )}
          </div>

          {/* Categories quick chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {CATEGORIES.slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                data-testid={`chip-${c}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  c === category
                    ? "bg-yellow-400 text-zinc-900 scale-105 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                    : "border border-yellow-500/20 text-zinc-300 hover:border-yellow-400/60 hover:text-yellow-300 hover:scale-105"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              {category ? `Categoria: ${category}` : "Todos os anúncios"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading
                ? "Carregando..."
                : `${filtered.length} anúncio${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilter={!!category || !!search.trim()}
            onClear={() => {
              setCategory(null);
              setSearch("");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </section>

      <footer className="relative z-10 border-t border-primary/15 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Néctar Agency — Domine o tráfego.</div>
          <div className="flex gap-5">
            <Link href="/plans" className="hover:text-primary">Planos VIP</Link>
            {isSignedIn ? (
              <Link href="/dashboard" className="hover:text-primary">Minha Conta</Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="hover:text-primary">Cadastrar</button>
              </SignUpButton>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function AdCard({
  ad,
}: {
  ad: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    category?: string | null;
    views: number;
    clicks: number;
  };
}) {
  return (
    <Link
      href={`/a/${ad.id}`}
      data-testid={`feed-card-${ad.id}`}
      className="group flex flex-col rounded-2xl bg-zinc-950/80 border border-yellow-500/12 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-yellow-400/55 hover:shadow-[0_15px_45px_-10px_rgba(255,215,0,0.45)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-yellow-500/10 via-zinc-900 to-zinc-950 overflow-hidden">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-yellow-500/30">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/0 to-transparent" />
        {ad.category && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400 text-zinc-900 text-[10px] font-bold tracking-wider shadow-[0_4px_12px_rgba(255,215,0,0.5)]">
            <Tag className="h-3 w-3" />
            {ad.category}
          </div>
        )}
        {/* Counters overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur text-white border border-yellow-500/20">
            <Eye className="h-3 w-3 text-yellow-400" />
            {ad.views.toLocaleString("pt-BR")}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur text-white border border-yellow-500/20">
            <MousePointerClick className="h-3 w-3 text-yellow-400" />
            {ad.clicks.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-yellow-300 transition-colors">
          {ad.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400 line-clamp-2 leading-snug">
          {ad.description}
        </p>
        <div className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 text-sm font-bold shadow-[0_6px_18px_-6px_rgba(255,180,0,0.55)] group-hover:shadow-[0_10px_28px_-4px_rgba(255,180,0,0.7)] transition-all">
          Ver anúncio
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-zinc-950/80 border border-yellow-500/10 overflow-hidden animate-pulse"
        >
          <div className="aspect-[16/10] bg-zinc-900" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-900 rounded" />
            <div className="h-3 w-2/3 bg-zinc-900 rounded" />
            <div className="h-9 w-full bg-zinc-900 rounded-lg mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilter,
  onClear,
}: {
  hasFilter: boolean;
  onClear: () => void;
}) {
  return (
    <div className="card-neon p-14 text-center">
      <div className="h-14 w-14 mx-auto rounded-full bg-yellow-400/15 grid place-items-center text-yellow-400 mb-4">
        <LayoutGrid className="h-6 w-6" />
      </div>
      <h3 className="font-display text-xl font-bold">
        {hasFilter ? "Nenhum anúncio encontrado" : "Ainda não há anúncios"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        {hasFilter
          ? "Tente outra categoria ou busca, ou seja o primeiro a publicar nessa área."
          : "Seja o primeiro a publicar e dominar o feed."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hasFilter && (
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-400/10 text-sm font-semibold transition"
          >
            Limpar filtros
          </button>
        )}
        <Link
          href="/ads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold text-sm hover:scale-[1.03] transition shadow-[0_8px_22px_-6px_rgba(255,180,0,0.55)]"
        >
          <Plus className="h-4 w-4" /> Criar anúncio
        </Link>
      </div>
    </div>
  );
}
