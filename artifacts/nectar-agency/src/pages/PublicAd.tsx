import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import {
  useGetAd,
  getGetAdQueryKey,
  useRegisterView,
  useRegisterClick,
} from "@workspace/api-client-react";
import { Particles } from "@/components/effects/Particles";
import { ExternalLink, Sparkles } from "lucide-react";

export function PublicAd() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: ad } = useGetAd(id, {
    query: { enabled: !!id, queryKey: getGetAdQueryKey(id) },
  });
  const registerView = useRegisterView();
  const registerClick = useRegisterClick();
  const fired = useRef(false);

  useEffect(() => {
    if (!id || fired.current) return;
    fired.current = true;
    registerView.mutate({ id });
  }, [id, registerView]);

  if (!ad) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Carregando anúncio...
      </div>
    );
  }

  const handleClick = () => {
    registerClick.mutate({ id: ad.id });
    setTimeout(() => {
      window.open(ad.link, "_blank", "noopener,noreferrer");
    }, 100);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <Particles density={50} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24">
        <a href="/" className="inline-flex items-center gap-2 mb-10 group">
          <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
            <span className="font-display font-black text-primary text-lg">N</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-widest">NÉCTAR</div>
            <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
          </div>
        </a>

        <div className="card-neon card-neon-hover p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Oferta destacada
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black leading-tight">
            {ad.title}
          </h1>
          <p className="mt-5 text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
            {ad.description}
          </p>
          <button
            onClick={handleClick}
            data-testid="button-cta-public"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-black text-lg neon-glow neon-btn"
          >
            Acessar agora
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Anúncio veiculado pela Néctar Agency
        </div>
      </div>
    </div>
  );
}
