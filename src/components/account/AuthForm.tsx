import { useState } from "react";
import { LogIn, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    else toast.success("Login realizado com sucesso!");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) toast.error(error.message);
    else toast.success("Conta criada! Verifique seu e-mail para confirmar.");
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) toast.error(error.message);
    else toast.success("E-mail de redefinição enviado!");
    setLoading(false);
  };

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  return (
    <div className="container py-12 md:py-20 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-bold text-center mb-8">Minha Conta</h1>

      {tab !== "reset" ? (
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("login")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-body text-sm font-semibold transition-colors ${tab === "login" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
            <LogIn size={16} /> Entrar
          </button>
          <button onClick={() => setTab("register")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-body text-sm font-semibold transition-colors ${tab === "register" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
            <UserPlus size={16} /> Cadastrar
          </button>
        </div>
      ) : (
        <button onClick={() => setTab("login")} className="text-sm text-accent hover:underline font-body mb-6 block">
          ← Voltar ao login
        </button>
      )}

      {tab === "login" && (
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
          <Button disabled={loading} className="w-full gradient-purple-pink text-primary-foreground font-body font-semibold h-12 glow-pink hover:opacity-90 transition-opacity">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-center text-xs text-muted-foreground font-body">
            Esqueceu sua senha?{" "}
            <button type="button" onClick={() => setTab("reset")} className="text-accent hover:underline">Redefinir</button>
          </p>
        </form>
      )}

      {tab === "register" && (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Nome completo</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Seu nome" />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Confirmar senha</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>
          <Button disabled={loading} className="w-full gradient-purple-pink text-primary-foreground font-body font-semibold h-12 glow-pink hover:opacity-90 transition-opacity">
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      )}

      {tab === "reset" && (
        <form className="space-y-4" onSubmit={handleReset}>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Informe seu e-mail para receber o link de redefinição de senha.
          </p>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" />
          </div>
          <Button disabled={loading} className="w-full gradient-purple-pink text-primary-foreground font-body font-semibold h-12 glow-pink hover:opacity-90 transition-opacity">
            {loading ? "Enviando..." : "Enviar Link"}
          </Button>
        </form>
      )}
    </div>
  );
}
