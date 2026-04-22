import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  Show,
  useClerk,
} from "@clerk/react";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
  useLocation,
} from "wouter";
import {
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { AdsList } from "@/pages/AdsList";
import { AdDetail } from "@/pages/AdDetail";
import { PublicAd } from "@/pages/PublicAd";
import { Plans } from "@/pages/Plans";
import { SignInPage, SignUpPage } from "@/pages/AuthPages";
import { SalesFeed } from "@/components/overlays/SalesFeed";
import { SupportChat } from "@/components/overlays/SupportChat";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#FFD700",
    colorForeground: "#FAFAFA",
    colorMutedForeground: "#A8A8A8",
    colorDanger: "#EF4444",
    colorBackground: "#0F0F0F",
    colorInput: "#1A1A1A",
    colorInputForeground: "#FAFAFA",
    colorNeutral: "#FFD700",
    colorModalBackdrop: "rgba(0,0,0,0.85)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "bg-[#0F0F0F] rounded-2xl w-[440px] max-w-full overflow-hidden border border-yellow-500/30 shadow-[0_0_60px_rgba(255,215,0,0.18)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer:
      "!shadow-none !border-0 !bg-transparent !rounded-none [&_*]:!text-white/70",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-white/65",
    socialButtonsBlockButton:
      "bg-[#1A1A1A] border border-yellow-500/20 hover:bg-[#222] hover:border-yellow-500/50 transition",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel: "text-white/85 font-medium",
    formFieldInput:
      "bg-[#1A1A1A] border border-yellow-500/20 text-white focus:border-yellow-500/60",
    formButtonPrimary:
      "bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow-[0_0_20px_rgba(255,215,0,0.45)] hover:shadow-[0_0_28px_rgba(255,215,0,0.6)] transition",
    footerActionLink:
      "text-yellow-400 hover:text-yellow-300 font-semibold",
    footerActionText: "text-white/60",
    footerAction: "text-white/60",
    dividerText: "text-white/55",
    dividerLine: "bg-yellow-500/15",
    identityPreviewEditButton: "text-yellow-400",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-white",
    alert: "bg-[#1A1A1A] border border-yellow-500/20",
    otpCodeFieldInput: "bg-[#1A1A1A] border border-yellow-500/20 text-white",
    formFieldRow: "",
    main: "",
    logoBox: "mb-2",
    logoImage: "h-8",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function Authed({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bem-vindo de volta",
            subtitle: "Entre para acessar seu painel Néctar",
          },
        },
        signUp: {
          start: {
            title: "Crie sua conta",
            subtitle: "Comece agora e domine o tráfego",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/a/:id" component={PublicAd} />
          <Route path="/plans" component={Plans} />
          <Route path="/dashboard">
            <Authed>
              <Dashboard />
            </Authed>
          </Route>
          <Route path="/ads">
            <Authed>
              <AdsList />
            </Authed>
          </Route>
          <Route path="/ads/:id">
            <Authed>
              <AdDetail />
            </Authed>
          </Route>
          <Route component={NotFound} />
        </Switch>
        <SalesFeed />
        <SupportChat />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
