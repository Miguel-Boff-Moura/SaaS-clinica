import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export function Login() {
  const { session, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      setError(error);
    }
    // em caso de sucesso, o navegador é redirecionado — não precisa desligar o loading
  }

  if (!loading && session) {
    const from = (location.state as { from?: string })?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "entrar") {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) setError("E-mail ou senha inválidos.");
      return;
    }

    const { error } = await signUp(email, password, nome);
    setSubmitting(false);
    if (error) {
      setError(error.includes("already registered") ? "Esse e-mail já tem conta — tenta entrar." : error);
      return;
    }
    setInfo("Conta criada! Se pedir confirmação por e-mail, confirma antes de entrar.");
    setMode("entrar");
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(600px 400px at 50% 0%, var(--color-primary-soft), transparent), var(--color-canvas)",
      }}
    >
      <Card className="w-full max-w-sm p-6 shadow-[var(--shadow-pop)]">
        <h1 className="font-display text-[22px] text-ink">Aurora</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "entrar" ? "Entrar no sistema da clínica" : "Criar minha conta de paciente"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "criar" && (
            <label className="text-[12px] font-medium text-muted">
              Nome completo
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-line-strong px-3 py-2 text-[13px] outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          )}
          <label className="text-[12px] font-medium text-muted">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-line-strong px-3 py-2 text-[13px] outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Senha
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "entrar" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-line-strong px-3 py-2 text-[13px] outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {error && <p className="text-[13px] text-danger">{error}</p>}
          {info && <p className="text-[13px] text-ok">{info}</p>}

          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Aguarde..." : mode === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase text-faint">ou</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={googleLoading}
          onClick={handleGoogle}
          className="w-full"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecionando..." : "Entrar com Google"}
        </Button>

        <button
          onClick={() => { setMode(mode === "entrar" ? "criar" : "entrar"); setError(null); setInfo(null); }}
          className="mt-4 w-full text-center text-[13px] text-primary-ink hover:underline"
        >
          {mode === "entrar" ? "Sou paciente e ainda não tenho conta" : "Já tenho conta"}
        </button>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.5-4.6 2.5-7.7 2.5-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.7 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C39.9 37.6 44 31.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
