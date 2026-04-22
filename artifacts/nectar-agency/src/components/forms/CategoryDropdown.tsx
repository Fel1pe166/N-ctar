import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Tag } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** "light" for white SaaS form, "dark" for filter on dark feed */
  variant?: "light" | "dark";
  testId?: string;
}

export function CategoryDropdown({
  value,
  onChange,
  placeholder = "Selecionar categoria",
  variant = "light",
  testId = "category-dropdown",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isLight = variant === "light";

  const triggerClasses = isLight
    ? `w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border-2 transition-all duration-300 ${
        open
          ? "border-yellow-400 shadow-[0_0_0_4px_rgba(255,215,0,0.18)]"
          : "border-zinc-200 hover:border-yellow-400/70"
      }`
    : `w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-950/80 border transition-all duration-300 text-sm ${
        open
          ? "border-yellow-400/70 shadow-[0_0_0_3px_rgba(255,215,0,0.12)]"
          : "border-yellow-500/15 hover:border-yellow-400/40"
      }`;

  return (
    <div ref={ref} className="relative w-full" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid={`${testId}-trigger`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={triggerClasses}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`h-7 w-7 grid place-items-center rounded-lg flex-none ${
              value
                ? "bg-yellow-400 text-zinc-900 shadow-[0_0_12px_rgba(255,215,0,0.55)]"
                : isLight
                  ? "bg-zinc-100 text-zinc-500"
                  : "bg-yellow-400/15 text-yellow-400"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
          </span>
          <span
            className={`truncate text-sm font-semibold ${
              value
                ? isLight
                  ? "text-zinc-900"
                  : "text-white"
                : isLight
                  ? "text-zinc-500"
                  : "text-zinc-400"
            }`}
          >
            {value ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          } ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        role="listbox"
        className={`absolute left-0 right-0 top-full mt-2 z-30 origin-top transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div
          className={`max-h-72 overflow-y-auto rounded-xl shadow-xl border ${
            isLight
              ? "bg-white border-zinc-200 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.18)]"
              : "bg-zinc-950 border-yellow-500/25 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.6)]"
          }`}
        >
          <ul className="py-2">
            {CATEGORIES.map((cat) => {
              const active = cat === value;
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(cat);
                      setOpen(false);
                    }}
                    data-testid={`${testId}-option-${cat}`}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-yellow-400 text-zinc-900 shadow-[inset_0_0_10px_rgba(255,255,255,0.45),0_0_18px_rgba(255,215,0,0.45)]"
                        : isLight
                          ? "text-zinc-800 hover:bg-yellow-50 hover:translate-x-1"
                          : "text-zinc-200 hover:bg-yellow-400/10 hover:text-yellow-300 hover:translate-x-1"
                    }`}
                  >
                    <span>{cat}</span>
                    {active && <Check className="h-4 w-4" strokeWidth={3} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
