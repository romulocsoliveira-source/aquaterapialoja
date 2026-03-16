import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export default function ForcePasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("A nova senha deve ser diferente da senha atual");
      return;
    }

    setLoading(true);

    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Senha atual incorreta");
      setLoading(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      toast.error(updateError.message);
      setLoading(false);
      return;
    }

    // Set first_login = false
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ first_login: false } as any)
      .eq("user_id", user!.id);

    if (profileError) {
      toast.error("Erro ao atualizar perfil");
      setLoading(false);
      return;
    }

    toast.success("Senha atualizada com sucesso. Bem-vindo ao sistema!");
    navigate("/admin");
    setLoading(false);
  };

  const inputClass =
    "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert className="w-12 h-12 text-accent mb-4" />
          <h1 className="font-display text-2xl font-bold text-center">Troca Obrigatória de Senha</h1>
          <p className="text-sm text-muted-foreground font-body text-center mt-2">
            Por segurança, é necessário alterar sua senha no primeiro acesso ao sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Senha atual</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Nova senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <Button
            disabled={loading}
            className="w-full gradient-purple-pink text-primary-foreground font-body font-semibold h-12 glow-pink hover:opacity-90 transition-opacity"
          >
            {loading ? "Atualizando..." : "Alterar Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
