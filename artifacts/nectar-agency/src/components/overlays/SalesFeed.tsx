import { useEffect, useState } from "react";
import { useGetNotificationFeed, getGetNotificationFeedQueryKey } from "@workspace/api-client-react";
import { TrendingUp } from "lucide-react";

export function SalesFeed() {
  const { data } = useGetNotificationFeed({
    query: {
      queryKey: getGetNotificationFeedQueryKey(),
      refetchInterval: 9000,
    },
  });
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % data.length);
        setVisible(true);
      }, 350);
    }, 6500);
    return () => clearInterval(t);
  }, [data]);

  if (!data || data.length === 0) return null;
  const n = data[idx % data.length]!;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-[320px] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      data-testid="sales-feed"
    >
      <div className="card-neon card-neon-hover px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="h-9 w-9 rounded-full grid place-items-center bg-primary/15 text-primary neon-glow-soft">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-sm leading-snug">
          <span className="font-semibold text-foreground">{n.name}</span>{" "}
          <span className="text-muted-foreground">acabou de comprar o plano</span>{" "}
          <span className="text-primary font-semibold">{n.plan}</span>
          <div className="text-[11px] text-muted-foreground mt-0.5">há {n.minutesAgo} minutos</div>
        </div>
      </div>
    </div>
  );
}
