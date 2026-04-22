import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Msg {
  id: string;
  from: "user" | "agent";
  text: string;
  ts: number;
}

const REPLIES = [
  "Olá! Sou da equipe Néctar, como posso te ajudar?",
  "Posso te mostrar como funciona nossos planos. Quer um resumo?",
  "Nossos anúncios começam a rodar em poucos minutos após a aprovação.",
  "Você pode acompanhar tudo em tempo real no seu painel.",
  "Se quiser, posso te indicar o plano ideal pro seu objetivo.",
  "Estou por aqui, qualquer coisa é só chamar!",
];

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "0",
      from: "agent",
      text: "Bem-vindo à Néctar! Em que posso te ajudar hoje?",
      ts: Date.now(),
    },
  ]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, open]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const userMsg: Msg = {
      id: String(Date.now()),
      from: "user",
      text: t,
      ts: Date.now(),
    };
    setMsgs((m) => [...m, userMsg]);
    setText("");
    setTimeout(() => {
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)]!;
      setMsgs((m) => [
        ...m,
        { id: String(Date.now() + 1), from: "agent", text: reply, ts: Date.now() },
      ]);
    }, 900 + Math.random() * 800);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="support-chat-toggle"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground neon-glow neon-btn grid place-items-center"
        aria-label="Abrir chat de suporte"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[340px] max-w-[calc(100vw-2rem)] h-[460px] card-neon flex flex-col shadow-2xl float-up"
          data-testid="support-chat-panel"
        >
          <div className="px-4 py-3 border-b border-primary/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary grid place-items-center font-display font-bold">
              N
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Atendente Néctar</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-soft" />
                Online agora
              </div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-primary/15"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-primary/20 p-2.5 flex gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-muted/60 border border-primary/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60"
              data-testid="support-chat-input"
            />
            <button
              type="submit"
              className="h-10 w-10 grid place-items-center rounded-lg bg-primary text-primary-foreground neon-btn"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
