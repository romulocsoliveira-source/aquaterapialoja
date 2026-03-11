import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfileTab() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCpf(data.cpf || "");
      }
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    // Use upsert to handle both insert and update cases
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, full_name: fullName, phone, cpf },
      { onConflict: "user_id" }
    );
    
    if (error) toast.error("Erro ao salvar perfil");
    else toast.success("Perfil atualizado!");
    setLoading(false);
  };

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="font-display text-xl font-bold mb-1">Dados Pessoais</h2>
      <p className="text-sm text-muted-foreground font-body mb-6">{user?.email}</p>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-body font-medium text-foreground block mb-1.5">Nome completo</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Seu nome" />
        </div>
        <div>
          <label className="text-sm font-body font-medium text-foreground block mb-1.5">Telefone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label className="text-sm font-body font-medium text-foreground block mb-1.5">CPF</label>
          <input value={cpf} onChange={e => setCpf(e.target.value)} className={inputClass} placeholder="000.000.000-00" />
        </div>
        <Button disabled={loading} className="gradient-purple-pink text-primary-foreground font-body font-semibold h-11">
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
}
