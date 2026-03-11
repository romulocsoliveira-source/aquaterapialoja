import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada com sucesso!");
      navigate("/conta");
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  return (
    <div className="container py-12 md:py-20 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-bold text-center mb-8">Nova Senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-body font-medium text-foreground block mb-1.5">Nova senha</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
        </div>
        <div>
          <label className="text-sm font-body font-medium text-foreground block mb-1.5">Confirmar nova senha</label>
          <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
        </div>
        <Button disabled={loading} className="w-full gradient-purple-pink text-primary-foreground font-body font-semibold h-12 glow-pink hover:opacity-90 transition-opacity">
          {loading ? "Atualizando..." : "Atualizar Senha"}
        </Button>
      </form>
    </div>
  );
}
