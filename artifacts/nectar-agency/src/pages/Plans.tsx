import {
  useListPlans,
  getListPlansQueryKey,
  useGetMe,
  getGetMeQueryKey,
  useCreateCheckout,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Show, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Check, Crown, Sparkles, Menu } from "lucide-react";
import { useState } from "react";

const PLAN_DESC: Record<string, string> = {
  free: "30 dias de acesso",
  basico: "7 dias de acesso",
  medio: "1 mês de acesso",
  avancado: "2 meses de acesso",
  ilimitado: "3 meses de acesso",
};

const PLAN_CTA: Record<string, string> = {
  free: "Ativar Grátis",
};

export function Plans() {
  return (
    <>
      <Show when="signed-in">
        <PlansAuthed />
      </Show>
      <Show when="signed-out">
        <PlansPublic />
      </Show>
    </>
  );
}

function PlansAuthed() {
  return (
    <DashboardShell>
      <Header />
      <PlansGrid />
    </DashboardShell>
  );
}

function PlansPublic() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
              <span className="font-display font-black text-primary text-lg">N</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-widest">
                NÉCTAR
              </div>
              <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            data-testid="button-open-drawer"
            className="md:hidden h-10 w-10 grid place-items-center rounded-lg border border-primary/30 hover:bg-primary/10"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <Header />
        <PlansGrid />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-12">
      <div className="text-xs font-bold tracking-[0.25em] text-primary mb-2">
        PLANOS VIP
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-black">
        Escolha sua <span className="neon-text">potência</span>
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-foreground/70">
        Pagamento único — comece agora e domine o tráfego.
      </p>
    </div>
  );
}

function PlansGrid() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const { isSignedIn } = useUser();
  const { data: plans } = useListPlans({
    query: { queryKey: getListPlansQueryKey() },
  });
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const checkout = useCreateCheckout();
  const [toast, setToast] = useState<string | null>(null);

  const subscribe = (planId: string, priceBRL: number) => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    if (priceBRL <= 0) {
      checkout.mutate(
        { data: { planId: planId as never } },
        {
          onSuccess: (res) => {
            setToast(res.message);
            qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
            qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            setTimeout(() => setToast(null), 4000);
          },
        },
      );
      return;
    }
    navigate(`/pix/${planId}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-6 items-stretch">
        {plans?.map((p) => {
          const isCurrent = me?.plan === p.id;
          const popular = p.highlight;
          return (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`group relative flex flex-col rounded-2xl bg-zinc-950/80 border transition-all duration-300 hover:-translate-y-2 shadow-lg ${
                popular
                  ? "border-yellow-400 shadow-[0_0_45px_-8px_rgba(255,215,0,0.55)] hover:shadow-[0_0_60px_-6px_rgba(255,215,0,0.75)] xl:scale-[1.05] xl:-mt-2 xl:mb-2 z-10"
                  : "border-yellow-500/15 hover:border-yellow-400/55 hover:shadow-[0_0_28px_-10px_rgba(255,215,0,0.5)]"
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 text-[10px] font-black tracking-widest shadow-[0_4px_18px_rgba(255,180,0,0.55)]">
                    <Sparkles className="h-3 w-3" />
                    MAIS POPULAR
                  </div>
                </div>
              )}

              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  {popular && <Crown className="h-4 w-4 text-yellow-400" />}
                  <h3 className="font-display text-xl font-bold text-white">
                    {p.name}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{PLAN_DESC[p.id]}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black bg-gradient-to-br from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    {p.priceBRL === 0
                      ? "R$ 0"
                      : `R$ ${p.priceBRL.toFixed(2).replace(".", ",")}`}
                  </span>
                  {p.priceBRL > 0 && (
                    <span className="text-xs text-zinc-500 font-medium">/total</span>
                  )}
                </div>

                <div className="my-5 h-px bg-gradient-to-r from-transparent via-yellow-500/25 to-transparent" />

                <ul className="space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-2.5 items-start text-zinc-200 leading-snug"
                    >
                      <span
                        className={`h-5 w-5 rounded-full grid place-items-center flex-none mt-px ${
                          popular
                            ? "bg-yellow-400 text-zinc-900"
                            : "bg-yellow-400/15 text-yellow-400"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrent || checkout.isPending}
                  onClick={() => subscribe(p.id, p.priceBRL)}
                  data-testid={`button-subscribe-${p.id}`}
                  className={`mt-7 group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                    popular || p.id === "ilimitado"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.55)] hover:shadow-[0_10px_28px_-4px_rgba(255,180,0,0.7)] hover:scale-[1.03]"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.45)] hover:shadow-[0_10px_28px_-4px_rgba(255,180,0,0.65)] hover:scale-[1.03]"
                  }`}
                >
                  {/* Shimmer */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                  <span className="relative z-10">
                    {isCurrent
                      ? "Plano atual"
                      : (PLAN_CTA[p.id] ?? "Assinar agora")}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          data-testid="toast-checkout"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold shadow-[0_10px_30px_-6px_rgba(255,180,0,0.6)] float-up"
        >
          {toast}
        </div>
      )}
    </>
  );
}
