import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export function Login() {
  const { session, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
