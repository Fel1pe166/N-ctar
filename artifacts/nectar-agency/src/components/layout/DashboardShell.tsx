import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  Megaphone,
  Crown,
  LifeBuoy,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { MobileDrawer } from "./MobileDrawer";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ads", label: "Anúncios", icon: Megaphone },
  { href: "/plans", label: "Planos", icon: Crown },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2.5 px-5 pt-6 pb-8 group">
        <div className="h-9 w-9 rounded-lg bg-primary/15 grid place-items-center neon-glow-soft">
          <span className="font-display font-black text-primary text-lg">N</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-widest">
            NÉCTAR
          </div>
          <div className="text-[10px] text-primary tracking-[0.3em]">AGENCY</div>
        </div>
      </Link>

      <nav className="px-3 flex-1 space-y-1">
        {NAV.map((item) => {
          const active =
            location === item.href || location.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all neon-btn ${
                active
                  ? "bg-primary/15 text-primary neon-glow-soft"
                  : "text-foreground/75 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto space-y-2">
        <a
          href="#support"
          onClick={(e) => {
            e.preventDefault();
            const btn = document.querySelector<HTMLButtonElement>(
              '[data-testid="support-chat-toggle"]',
            );
            btn?.click();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/75 hover:bg-muted hover:text-foreground transition-all"
        >
          <LifeBuoy className="h-4 w-4" />
          Suporte
        </a>
        <div className="border-t border-primary/15 pt-3 px-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center text-primary font-bold text-sm">
            {(user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            data-testid="button-logout"
            className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-primary/15 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-sidebar border-b border-primary/15 flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 grid place-items-center neon-glow-soft">
            <span className="font-display font-black text-primary text-sm">N</span>
          </div>
          <span className="font-display font-bold tracking-widest text-sm">NÉCTAR</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="px-4 md:px-10 py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
