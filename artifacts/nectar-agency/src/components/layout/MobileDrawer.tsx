import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/react";
import {
  Home,
  LayoutGrid,
  Crown,
  User,
  LogIn,
  UserPlus,
  LogOut,
  X,
} from "lucide-react";

interface DrawerItem {
  href?: string;
  label: string;
  icon: typeof Home;
}

const ITEMS: DrawerItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/ads", label: "Categorias", icon: LayoutGrid },
  { href: "/plans", label: "Planos VIP", icon: Crown },
  { href: "/dashboard", label: "Minha Conta", icon: User },
];

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [location] = useLocation();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        data-testid="mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-[82%] max-w-[320px] bg-white text-zinc-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-yellow-100">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-yellow-400 grid place-items-center shadow-[0_0_18px_rgba(255,215,0,0.55)]">
              <span className="font-display font-black text-zinc-900 text-lg">N</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-widest text-zinc-900">
                NÉCTAR
              </div>
              <div className="text-[10px] text-yellow-500 font-bold tracking-[0.3em]">
                AGENCY
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            data-testid="button-drawer-close"
            className="h-9 w-9 grid place-items-center rounded-lg text-zinc-500 hover:bg-yellow-100 hover:text-zinc-900 transition-all"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User chip */}
        {isSignedIn && (
          <div className="mx-4 mt-4 px-3 py-3 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-yellow-400 grid place-items-center text-zinc-900 font-bold">
              {(user?.firstName?.[0] ||
                user?.emailAddresses[0]?.emailAddress?.[0] ||
                "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-zinc-900">
                {user?.firstName ||
                  user?.emailAddresses[0]?.emailAddress?.split("@")[0]}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {ITEMS.map((item) => {
            const active =
              item.href &&
              (location === item.href ||
                (item.href !== "/" && location.startsWith(item.href)));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={onClose}
                data-testid={`drawer-nav-${item.label}`}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                  active
                    ? "bg-yellow-100 text-zinc-900 scale-[1.02] shadow-[inset_0_0_0_1px_rgba(255,200,0,0.55)]"
                    : "text-zinc-700 hover:bg-yellow-50 hover:text-zinc-900 hover:scale-[1.02]"
                }`}
              >
                <span
                  className={`h-9 w-9 grid place-items-center rounded-lg transition-all ${
                    active
                      ? "bg-yellow-400 text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 group-hover:bg-yellow-300 group-hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}

          {/* Auth buttons */}
          <div className="pt-3 mt-3 border-t border-yellow-100 space-y-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button
                    onClick={onClose}
                    data-testid="drawer-button-signin"
                    className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-yellow-50 hover:text-zinc-900 hover:scale-[1.02] transition-all duration-300"
                  >
                    <span className="h-9 w-9 grid place-items-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-yellow-300 group-hover:text-zinc-900 transition-all">
                      <LogIn className="h-4 w-4" />
                    </span>
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={onClose}
                    data-testid="drawer-button-signup"
                    className="group w-full relative overflow-hidden flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold text-zinc-900 bg-gradient-to-r from-yellow-400 to-orange-400 shadow-[0_8px_22px_-6px_rgba(255,180,0,0.55)] hover:scale-[1.03] transition-all duration-300"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    <UserPlus className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Cadastrar</span>
                  </button>
                </SignUpButton>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                data-testid="drawer-button-logout"
                className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:scale-[1.02] transition-all duration-300"
              >
                <span className="h-9 w-9 grid place-items-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                  <LogOut className="h-4 w-4" />
                </span>
                Sair
              </button>
            )}
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-yellow-100 text-center text-[11px] text-zinc-500">
          © {new Date().getFullYear()} Néctar Agency
        </div>
      </aside>
    </>
  );
}
