import { useState } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import {
  useListAdminPayments,
  getListAdminPaymentsQueryKey,
  useApprovePayment,
  useRejectPayment,
  useGetMe,
  getGetMeQueryKey,
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
  AlertTriangle,
} from "lucide-react";

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
  return (
    <Show when="signed-in">
      <AdminPaymentsAuthed />
    </Show>
  );
}

function AdminPaymentsAuthed() {
  const { data: me, isLoading: meLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending",
  );

  if (meLoading) {
    return <DashboardShell><div className="text-sm text-muted-foreground">Carregando...</div></DashboardShell>;
  }

  if (me?.role !== "admin") {
    return (
      <DashboardShell>
        <div className="max-w-md mx-auto card-neon p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-red-500/15 grid place-items-center text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Esta página é exclusiva do administrador.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-5 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-zinc-900 font-bold text-sm"
          >
            Voltar
          </Link>
        </div>
      </DashboardShell>
    );
  }

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
