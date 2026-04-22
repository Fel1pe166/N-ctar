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
import { Show } from "@clerk/react";
import { Check, Crown, Sparkles } from "lucide-react";
import { useState } from "react";

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
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
            <span className="font-display font-black text-primary text-lg">N</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-widest">NÉCTAR</div>
            <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
          </div>
        </a>
        <Header />
        <PlansGrid />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-12">
      <div className="text-xs font-bold tracking-[0.25em] text-primary mb-2">PLANOS</div>
      <h1 className="font-display text-4xl md:text-5xl font-black">
        Escolha sua <span className="neon-text">potência</span>
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-foreground/70">
        Do free ao ilimitado — escale na velocidade do seu negócio. Cancele quando quiser.
      </p>
    </div>
  );
}

function PlansGrid() {
  const qc = useQueryClient();
  const { data: plans } = useListPlans({
    query: { queryKey: getListPlansQueryKey() },
  });
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const checkout = useCreateCheckout();
  const [toast, setToast] = useState<string | null>(null);

  const subscribe = (planId: string) => {
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
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {plans?.map((p) => {
          const isCurrent = me?.plan === p.id;
          return (
            <div
              key={p.id}
              data-testid={`plan-${p.id}`}
              className={`card-neon p-6 flex flex-col relative ${
                p.highlight ? "card-neon-hover ring-1 ring-primary/60" : ""
              }`}
            >
              {p.highlight && (
                <div className="-mt-9 mb-4 self-start px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-widest inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> MAIS POPULAR
                </div>
              )}
              <div className="flex items-center gap-2">
                {p.highlight && <Crown className="h-4 w-4 text-primary" />}
                <div className="font-display text-lg font-bold">{p.name}</div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black neon-text">
                  R$ {p.priceBRL.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.adsLimit >= 9999
                  ? "Anúncios ilimitados"
                  : `${p.adsLimit} anúncio${p.adsLimit > 1 ? "s" : ""} ativo${p.adsLimit > 1 ? "s" : ""}`}
              </div>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 items-start">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-none" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || checkout.isPending}
                onClick={() => subscribe(p.id)}
                data-testid={`button-subscribe-${p.id}`}
                className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm neon-btn disabled:opacity-60 disabled:cursor-not-allowed ${
                  p.highlight
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "border border-primary/40 hover:bg-primary/10"
                }`}
              >
                {isCurrent ? "Plano atual" : "Assinar agora"}
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 card-neon px-5 py-3 neon-glow float-up">
          <div className="text-sm font-semibold text-primary">{toast}</div>
        </div>
      )}
    </>
  );
}
