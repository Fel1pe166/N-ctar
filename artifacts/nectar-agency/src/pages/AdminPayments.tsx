import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  useListAdminPayments,
  getListAdminPaymentsQueryKey,
  useApprovePayment,
  useRejectPayment,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  ShieldCheck,
  Check,
  X,
  ImageIcon,
  Clock,
  Mail,
  ExternalLink,
  Filter,
  Lock,
  User as UserIcon,
  Sparkles,
  KeyRound,
  HelpCircle,
} from "lucide-react";
import { getAdminToken, setAdminToken } from "@/lib/adminAuth";

const STATUS_TABS: Array<{
  id: "pending" | "approved" | "rejected" | "all";
  label: string;
}> = [
  { id: "pending", label: "Pendentes" },
  { id: "approved", label: "Aprovados" },
  { id: "rejected", label: "Rejeitados" },
  { id: "all", label: "Todos" },
];

export function AdminPayments() {
  const [unlocked, setUnlocked] = useState<boolean>(() => !!getAdminToken());

  useEffect(() => {
    if (getAdminToken()) setUnlocked(true);
  }, []);

  if (!unlocked) {
    return <AdminActivation onActivated={() => setUnlocked(true)} />;
  }
  return <AdminPaymentsPanel />;
}

function AdminActivation({ onActivated }: { onActivated: () => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const cardRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Credenciais inválidas.");
      }
      const data = (await res.json()) as { token: string };
      setAdminToken(data.token);
      setSuccess(true);
      setTimeout(() => onActivated(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na ativação.");
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 admin-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-100px] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      <div className="relative min-h-screen grid place-items-center px-4 py-10">
        <form
          ref={cardRef}
          onSubmit={handleSubmit}
          data-testid="admin-activation-form"
          className={`w-full max-w-md card-neon p-8 admin-fade-in ${
            shake ? "animate-shake" : ""
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 text-zinc-900 grid place-items-center neon-glow-soft mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-[11px] font-bold text-yellow-300 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Sistema Néctar
            </div>
            <h1 className="font-display text-2xl font-black text-zinc-100 mt-4 leading-tight">
              Ativação do Sistema
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Administrativo
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs">
              Confirme sua identidade para liberar o painel de aprovações.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            <Field
              icon={<UserIcon className="h-4 w-4" />}
              label="O nome do admin qual é?"
              hint="Resposta esperada: Felipe"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                autoFocus
                placeholder="Felipe"
                autoComplete="off"
                data-testid="input-admin-name"
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/30 transition"
              />
            </Field>

            <Field
              icon={<KeyRound className="h-4 w-4" />}
              label="Senha de acesso"
            >
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                data-testid="input-admin-password"
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/30 transition"
              />
            </Field>

            <div className="rounded-lg bg-zinc-900/60 border border-yellow-400/20 p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-yellow-300 uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5" />
                Por que o nome Néctar?
              </div>
              <p className="mt-2 text-sm text-zinc-200 italic">
                "Néctar é a próxima empresa da evolução."
              </p>
            </div>

            {error && (
              <div
                role="alert"
                data-testid="admin-error"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-xs text-red-300"
              >
                <X className="h-3.5 w-3.5 flex-none" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="button-activate-admin"
              className="group relative w-full overflow-hidden py-3.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-display font-black text-sm uppercase tracking-wide hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_30px_-8px_rgba(255,180,0,0.7)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                {submitting ? "Validando..." : "Ativar Admin"}
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 text-center mt-5 uppercase tracking-wider">
            Acesso protegido • validação no servidor
          </p>
        </form>
      </div>

      {success && <SuccessOverlay />}
    </div>
  );
}

function Field({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-1.5">
        <span className="text-yellow-400">{icon}</span>
        {label}
      </div>
      {children}
      {hint && <div className="text-[10px] text-zinc-500 mt-1">{hint}</div>}
    </label>
  );
}

function SuccessOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/85 backdrop-blur-sm admin-fade-in"
      data-testid="admin-success-overlay"
    >
      <div className="card-neon green-glow admin-success-pop p-10 max-w-sm w-[90%] text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 grid place-items-center text-green-400 mb-4 ring-2 ring-green-500/50">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h2 className="font-display text-xl font-black text-zinc-100">
          Admin ativado com sucesso
        </h2>
        <p className="text-xs text-zinc-400 mt-2">
          Carregando painel administrativo...
        </p>
        <div className="mt-6 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full admin-progress-bar bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
    </div>
  );
}

function AdminPaymentsPanel() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending",
  );
  return (
    <DashboardShell>
      <PanelHeader />
      <Tabs value={status} onChange={setStatus} />
      <PaymentsList status={status} />
    </DashboardShell>
  );
}

function PanelHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 text-zinc-900 grid place-items-center shadow-[0_8px_22px_-6px_rgba(255,180,0,0.6)]">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-black">Painel de pagamentos</h1>
        <p className="text-xs text-muted-foreground">
          Aprove ou rejeite comprovantes PIX dos usuários.
        </p>
      </div>
    </div>
  );
}

function Tabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "pending" | "approved" | "rejected" | "all") => void;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-5 p-1 rounded-xl bg-zinc-950/60 border border-yellow-500/15 w-fit">
      <Filter className="h-3.5 w-3.5 text-yellow-400 mx-2" />
      {STATUS_TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            data-testid={`tab-${t.id}`}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              active
                ? "bg-yellow-400 text-zinc-900 shadow-[0_0_15px_rgba(255,215,0,0.45)]"
                : "text-zinc-400 hover:text-yellow-300"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function PaymentsList({ status }: { status: "pending" | "approved" | "rejected" | "all" }) {
  const qc = useQueryClient();
  const { data: payments, isLoading } = useListAdminPayments(
    { status },
    { query: { queryKey: getListAdminPaymentsQueryKey({ status }) } },
  );
  const approve = useApprovePayment();
  const reject = useRejectPayment();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: getListAdminPaymentsQueryKey({ status }) });
    qc.invalidateQueries({ queryKey: getListAdminPaymentsQueryKey({ status: "pending" }) });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-neon p-5 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="card-neon p-12 text-center">
        <div className="h-14 w-14 mx-auto rounded-full bg-yellow-400/15 grid place-items-center text-yellow-400 mb-4">
          <ImageIcon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-bold">Nenhum pagamento</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Não há pagamentos com este status no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {payments.map((p) => (
        <PaymentCard
          key={p.id}
          payment={p}
          onApprove={() =>
            approve.mutate(
              { id: p.id },
              { onSuccess: refresh },
            )
          }
          onReject={() =>
            reject.mutate(
              { id: p.id },
              { onSuccess: refresh },
            )
          }
          busy={approve.isPending || reject.isPending}
        />
      ))}
    </div>
  );
}

function PaymentCard({
  payment,
  onApprove,
  onReject,
  busy,
}: {
  payment: {
    id: string;
    userEmail?: string | null;
    userName?: string | null;
    plan: string;
    amountBRL: number;
    proofUrl: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  };
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  const [zoom, setZoom] = useState(false);
  const date = new Date(payment.createdAt).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const statusBadge = {
    pending: { label: "Pendente", cls: "bg-yellow-400 text-zinc-900" },
    approved: { label: "Aprovado", cls: "bg-green-500 text-white" },
    rejected: { label: "Rejeitado", cls: "bg-red-500 text-white" },
  }[payment.status];

  return (
    <>
      <div
        className="card-neon p-5 flex flex-col gap-4"
        data-testid={`payment-${payment.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold truncate">
              <Mail className="h-4 w-4 text-yellow-400 flex-none" />
              <span className="truncate">{payment.userEmail ?? "—"}</span>
            </div>
            {payment.userName && (
              <div className="text-xs text-muted-foreground truncate ml-6">
                {payment.userName}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 ml-6">
              <Clock className="h-3 w-3" />
              {date}
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadge.cls}`}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-950/60 border border-yellow-500/15">
          <div className="flex-1">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Plano</div>
            <div className="font-bold text-yellow-300 capitalize">{payment.plan}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Valor</div>
            <div className="font-display font-black text-lg">
              R$ {payment.amountBRL.toFixed(2).replace(".", ",")}
            </div>
          </div>
        </div>

        <button
          onClick={() => setZoom(true)}
          data-testid={`view-proof-${payment.id}`}
          className="group relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-950 border border-yellow-500/15 hover:border-yellow-400/60 transition"
        >
          <img
            src={payment.proofUrl}
            alt="Comprovante PIX"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition grid place-items-center opacity-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-black/60">
              <ExternalLink className="h-3.5 w-3.5" /> Ampliar
            </span>
          </div>
        </button>

        {payment.status === "pending" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onApprove}
              disabled={busy}
              data-testid={`approve-${payment.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition shadow-[0_8px_20px_-6px_rgba(34,197,94,0.55)] hover:scale-[1.02] disabled:opacity-60"
            >
              <Check className="h-4 w-4" /> Aprovar
            </button>
            <button
              onClick={onReject}
              disabled={busy}
              data-testid={`reject-${payment.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition shadow-[0_8px_20px_-6px_rgba(239,68,68,0.55)] hover:scale-[1.02] disabled:opacity-60"
            >
              <X className="h-4 w-4" /> Rejeitar
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-center text-muted-foreground">
            Revisão concluída.
          </div>
        )}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setZoom(false)}
        >
          <img
            src={payment.proofUrl}
            alt="Comprovante PIX ampliado"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
