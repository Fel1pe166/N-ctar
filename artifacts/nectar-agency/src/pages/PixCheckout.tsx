import { useMemo, useRef, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Show } from "@clerk/react";
import {
  useGetPixConfig,
  getGetPixConfigQueryKey,
  useListPlans,
  getListPlansQueryKey,
  useCreatePayment,
  useGetMe,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Copy,
  Check,
  Upload,
  ImageIcon,
  ShieldCheck,
  Clock,
  ArrowLeft,
  X,
} from "lucide-react";

export function PixCheckout() {
  return (
    <Show when="signed-in">
      <PixCheckoutAuthed />
    </Show>
  );
}

function PixCheckoutAuthed() {
  const params = useParams<{ planId: string }>();
  const planId = params.planId;
  const [, navigate] = useLocation();

  const { data: plans } = useListPlans({ query: { queryKey: getListPlansQueryKey() } });
  const { data: pix } = useGetPixConfig({ query: { queryKey: getGetPixConfigQueryKey() } });
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const createPayment = useCreatePayment();

  const plan = useMemo(
    () => (plans ?? []).find((p) => p.id === planId),
    [plans, planId],
  );

  const [proof, setProof] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > 4_500_000) {
      setError("Imagem muito grande. Máximo 4.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProof(typeof reader.result === "string" ? reader.result : null);
      setProofName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const copyPix = async () => {
    if (!pix?.pixKey) return;
    try {
      await navigator.clipboard.writeText(pix.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !proof) return;
    setError(null);
    createPayment.mutate(
      { data: { planId: plan.id as "basico" | "medio" | "avancado" | "ilimitado", proofUrl: proof } },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { error?: string } } };
          setError(e?.response?.data?.error ?? "Erro ao enviar pagamento.");
        },
      },
    );
  };

  if (!plan) {
    return (
      <DashboardShell>
        <div className="card-neon p-12 text-center">
          <h2 className="font-display text-xl font-bold">Plano não encontrado</h2>
          <p className="text-sm text-muted-foreground mt-2">
            O plano selecionado não existe.
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="mt-5 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold text-sm"
          >
            Ver planos
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (plan.priceBRL <= 0) {
    return (
      <DashboardShell>
        <div className="card-neon p-12 text-center">
          <h2 className="font-display text-xl font-bold">Plano gratuito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Este plano não exige pagamento.
          </p>
          <Link
            href="/plans"
            className="mt-5 inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold text-sm"
          >
            Voltar aos planos
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (submitted) {
    return (
      <DashboardShell>
        <SuccessState planName={plan.name} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos planos
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          {/* Left: PIX info */}
          <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl ring-1 ring-yellow-300/40 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-900/70">
                Plano selecionado
              </div>
              <div className="flex items-end justify-between gap-4 mt-1">
                <div className="font-display text-3xl font-black text-zinc-900">
                  {plan.name}
                </div>
                <div className="font-display text-3xl font-black text-zinc-900">
                  R$ {plan.priceBRL.toFixed(2).replace(".", ",")}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  1. Pague via PIX
                </div>
                {pix?.qrUrl ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-none p-2 bg-white border-2 border-zinc-200 rounded-xl">
                      <img
                        src={pix.qrUrl}
                        alt="QR Code PIX"
                        className="h-40 w-40 block"
                        data-testid="pix-qr"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="text-xs text-zinc-600 mb-1">Chave PIX</div>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-50 border-2 border-zinc-200">
                        <code
                          className="flex-1 text-xs font-mono text-zinc-900 break-all"
                          data-testid="pix-key"
                        >
                          {pix.pixKey}
                        </code>
                        <button
                          onClick={copyPix}
                          data-testid="button-copy-pix"
                          className="flex-none h-8 w-8 grid place-items-center rounded-md bg-yellow-400 text-zinc-900 hover:scale-110 transition"
                          aria-label="Copiar chave PIX"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2 leading-snug">
                        Abra o app do seu banco, escaneie o QR ou cole a chave acima e pague exatamente <strong>R$ {plan.priceBRL.toFixed(2).replace(".", ",")}</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Carregando dados PIX...</div>
                )}
              </div>

              <div className="border-t border-zinc-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Pagamento manual com aprovação rápida (até 30 min em horário comercial).
                </div>
              </div>
            </div>
          </div>

          {/* Right: upload form */}
          <form
            onSubmit={submit}
            className="bg-white text-zinc-900 rounded-2xl shadow-2xl ring-1 ring-yellow-300/40 p-6"
          >
            <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              2. Envie seu comprovante
            </div>
            <p className="text-sm text-zinc-500 mb-4 leading-snug">
              Anexe a captura de tela do PIX. Após sua confirmação, o plano <strong>{plan.name}</strong> será ativado.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              className="hidden"
              data-testid="input-proof"
            />

            {!proof ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                data-testid="button-upload-proof"
                className="w-full border-2 border-dashed border-zinc-300 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl py-10 flex flex-col items-center justify-center gap-2 transition"
              >
                <div className="h-12 w-12 rounded-full bg-yellow-100 grid place-items-center text-yellow-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-zinc-700">
                  Clique para enviar o comprovante
                </div>
                <div className="text-[11px] text-zinc-500">
                  PNG, JPG ou WebP — até 4.5 MB
                </div>
              </button>
            ) : (
              <div className="border-2 border-zinc-200 rounded-xl overflow-hidden">
                <div className="relative bg-zinc-50 grid place-items-center max-h-72 overflow-hidden">
                  <img
                    src={proof}
                    alt="Comprovante"
                    className="max-h-72 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProof(null);
                      setProofName(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-white/90 hover:bg-white text-zinc-700 shadow-md"
                    aria-label="Remover comprovante"
                    data-testid="button-remove-proof"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-3 py-2 flex items-center gap-2 text-xs text-zinc-600 border-t border-zinc-200">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span className="truncate">{proofName}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!proof || createPayment.isPending}
              data-testid="button-submit-payment"
              className="group relative overflow-hidden mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-black text-sm shadow-[0_10px_28px_-6px_rgba(255,180,0,0.55)] hover:shadow-[0_14px_38px_-4px_rgba(255,180,0,0.75)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
              <span className="relative z-10">
                {createPayment.isPending ? "Enviando..." : "Enviar comprovante"}
              </span>
            </button>

            <p className="mt-3 text-[11px] text-zinc-500 text-center">
              {me?.email
                ? `Conta: ${me.email}`
                : "O pagamento será associado à sua conta logada."}
            </p>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}

function SuccessState({ planName }: { planName: string }) {
  return (
    <div className="max-w-xl mx-auto card-neon p-10 text-center">
      <div className="h-16 w-16 mx-auto rounded-full bg-yellow-400/15 grid place-items-center text-yellow-400 mb-4">
        <Clock className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-black">
        Comprovante recebido
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
        Seu pedido para o plano <strong className="text-primary">{planName}</strong> está em análise. Assim que aprovado, seu plano será ativado automaticamente.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-400/10 text-sm font-semibold transition"
        >
          Ir para minha conta
        </Link>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold text-sm hover:scale-[1.03] transition"
        >
          Ver marketplace
        </Link>
      </div>
    </div>
  );
}
