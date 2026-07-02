import * as React from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogIn, Sparkles } from "lucide-react";

import { LoginDevMode } from "@/components/login/login-dev-mode";
import { LoginPipelinePanel } from "@/components/login/login-pipeline-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-store";
import { getDefaultPortalPath } from "@/lib/auth/session";
import { pageTitle, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/product-branding";

type LoginSearch = {
  redirect?: string;
};

function safeRedirectPath(path: string | undefined): string | undefined {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return undefined;
  return path;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      const target = safeRedirectPath(search.redirect) ?? getDefaultPortalPath(context.session);
      throw redirect({ to: target });
    }
  },
  head: () => ({ meta: [{ title: pageTitle("Login") }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { redirect: redirectTo } = Route.useSearch();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const session = await login(email, password);
      const target = safeRedirectPath(redirectTo) ?? getDefaultPortalPath(session);
      await router.navigate({ to: target, replace: true });
      toast.success(`Bem-vindo, ${session.user.nome}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (mockEmail: string, mockPassword: string) => {
    setEmail(mockEmail);
    setPassword(mockPassword);
    setLoading(true);
    try {
      const session = await login(mockEmail, mockPassword);
      const target = safeRedirectPath(redirectTo) ?? getDefaultPortalPath(session);
      await router.navigate({ to: target, replace: true });
      toast.success(`Bem-vindo, ${session.user.nome}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[42fr_58fr]">
      <div className="relative flex flex-col bg-background">
        <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider uppercase text-foreground">
                  {PRODUCT_NAME}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Todo o seu negócio de creator em um único lugar.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </form>

            <p className="text-center text-[11px] text-muted-foreground">{PRODUCT_TAGLINE}</p>
          </div>
        </div>

        <footer className="flex items-center justify-between px-8 pb-6 sm:px-12 lg:px-16">
          <LoginDevMode loading={loading} onSelectProfile={(e, p) => void handleQuickLogin(e, p)} />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </p>
        </footer>
      </div>

      <div className="hidden border-l border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <LoginPipelinePanel />
      </div>
    </div>
  );
}
