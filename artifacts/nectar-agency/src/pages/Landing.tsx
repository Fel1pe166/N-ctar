import { SignInButton, SignUpButton } from "@clerk/react";
import { Link } from "wouter";
import { useListPlans, getListPlansQueryKey } from "@workspace/api-client-react";
import { Particles } from "@/components/effects/Particles";
import {
  Zap,
  BarChart3,
  Rocket,
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  Trophy,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    title: "Tráfego real",
    desc: "Visitantes qualificados, não bots. Cada clique é uma oportunidade real de venda.",
  },
  {
    icon: BarChart3,
    title: "Estatísticas em tempo real",
    desc: "Acompanhe views, cliques e CTR ao vivo no seu painel premium.",
  },
  {
    icon: Rocket,
    title: "Crescimento rápido",
    desc: "Tecnologia avançada para escalar sua presença digital com velocidade.",
  },
];

export function Landing() {
  const { data: plans } = useListPlans({
    query: { queryKey: getListPlansQueryKey() },
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Top nav */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
            <span className="font-display font-black text-primary text-lg">N</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-widest">NÉCTAR</div>
            <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/80">
          <a href="#beneficios" className="hover:text-primary transition">Benefícios</a>
          <a href="#planos" className="hover:text-primary transition">Planos</a>
          <a href="#sobre" className="hover:text-primary transition">Sobre</a>
        </nav>
        <div className="flex items-center gap-2">
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
              className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground neon-glow neon-btn"
            >
              Criar conta
            </button>
          </SignUpButton>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <Particles density={70} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary mb-7 neon-glow-soft">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma premium para crescimento digital
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05] tracking-tight">
            Domine o tráfego.
            <br />
            <span className="neon-text">Cresça com a Néctar.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/70 leading-relaxed">
            Crie anúncios, acompanhe cada clique em tempo real e transforme visualizações em resultados reais.
            Tecnologia de nível AAA para quem leva o digital a sério.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignUpButton mode="modal">
              <button
                data-testid="button-start"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold neon-glow neon-btn"
              >
                Começar agora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </button>
            </SignUpButton>
            <Link
              href="/plans"
              data-testid="button-see-plans"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-primary/40 text-foreground font-semibold hover:bg-primary/10 hover:border-primary transition neon-btn"
            >
              Ver planos
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 max-w-2xl mx-auto gap-4 text-center">
            <Stat label="Cliques entregues" value="+2.4M" />
            <Stat label="Anúncios ativos" value="18.7K" />
            <Stat label="Conversão média" value="9.4%" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow="Por que Néctar"
          title="Tudo que você precisa para crescer"
          subtitle="Uma plataforma pensada para empreendedores digitais que querem velocidade, dados e impacto."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="card-neon card-neon-hover p-7 group transition-transform hover:-translate-y-1"
              data-testid={`benefit-${b.title}`}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/15 grid place-items-center text-primary mb-5 neon-glow-soft">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{b.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans preview */}
      <section id="planos" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <SectionHeader
          eyebrow="Planos"
          title="Escolha sua potência"
          subtitle="Do free ao ilimitado — escale na velocidade do seu negócio."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans?.map((p) => (
            <div
              key={p.id}
              data-testid={`plan-card-${p.id}`}
              className={`card-neon p-6 flex flex-col ${
                p.highlight ? "card-neon-hover ring-1 ring-primary/60 neon-glow-soft" : ""
              }`}
            >
              {p.highlight && (
                <div className="-mt-9 mb-4 self-start px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-widest">
                  MAIS POPULAR
                </div>
              )}
              <div className="font-display text-lg font-bold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black neon-text">
                  R$ {p.priceBRL.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.adsLimit >= 9999 ? "Anúncios ilimitados" : `${p.adsLimit} anúncios ativos`}
              </div>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 items-start">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-none" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/plans"
                className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm neon-btn ${
                  p.highlight
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "border border-primary/40 hover:bg-primary/10"
                }`}
                data-testid={`button-choose-${p.id}`}
              >
                Assinar agora
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Marketing about */}
      <section id="sobre" className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="card-neon card-neon-hover p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl pulse-soft" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-primary mb-4">
              <Trophy className="h-3.5 w-3.5" /> A NÉCTAR AGENCY
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black leading-tight">
              A plataforma definitiva para
              <br />
              <span className="neon-text">dominar o digital.</span>
            </h2>
            <p className="mt-6 text-foreground/80 text-lg leading-relaxed max-w-3xl">
              A <strong>Néctar Agency</strong> é a plataforma definitiva para quem deseja crescer no digital
              com velocidade, estratégia e impacto. Com tecnologia avançada, dados em tempo real e um
              sistema inteligente de divulgação, você transforma visualizações em resultados reais. Domine
              o tráfego, escale sua presença e alcance um novo nível.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <FeatureMini icon={ShieldCheck} text="Plataforma confiável" />
              <FeatureMini icon={BarChart3} text="Dados em tempo real" />
              <FeatureMini icon={Rocket} text="Crescimento exponencial" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/15 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-primary">N</span>
            <span>© {new Date().getFullYear()} Néctar Agency — Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-5">
            <a href="#beneficios" className="hover:text-primary">Benefícios</a>
            <a href="#planos" className="hover:text-primary">Planos</a>
            <a href="#sobre" className="hover:text-primary">Sobre</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-neon px-4 py-4">
      <div className="font-display text-2xl font-bold neon-text">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 tracking-wider uppercase">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs font-bold tracking-[0.25em] text-primary mb-3">
        {eyebrow.toUpperCase()}
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-black">{title}</h2>
      <p className="mt-3 max-w-2xl mx-auto text-foreground/70">{subtitle}</p>
    </div>
  );
}

function FeatureMini({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 border border-primary/15">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
