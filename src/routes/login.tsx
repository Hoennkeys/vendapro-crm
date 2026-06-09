import * as React from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogIn, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-store";
import { MOCK_LOGIN_HINTS } from "@/lib/auth/mock-users";
import { getDefaultPortalPath } from "@/lib/auth/session";

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
  head: () => ({ meta: [{ title: "Login — VendaPro CRM" }] }),
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>VendaPro CRM</CardTitle>
                <CardDescription>Login unificado para todos os portais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contas mock (Fase 2)</CardTitle>
            <CardDescription>Clique para entrar direto no portal correto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_LOGIN_HINTS.map((hint) => (
              <button
                key={hint.email}
                type="button"
                disabled={loading}
                onClick={() => void handleQuickLogin(hint.email, hint.password)}
                className="w-full rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
              >
                <p className="text-sm font-medium">{hint.nome}</p>
                <p className="text-xs text-muted-foreground">{hint.email}</p>
                <p className="mt-1 text-xs text-primary">Portal: {hint.tipo}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
