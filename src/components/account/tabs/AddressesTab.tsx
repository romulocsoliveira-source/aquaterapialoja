import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCepLookup } from "@/hooks/useCepLookup";

interface Address {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean | null;
}

export default function AddressesTab() {
  const { user } = useAuth();
  const { lookupCep, loading: cepLoading, formatCep } = useCepLookup();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "Casa", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" });

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const resetForm = () => {
    setForm({ label: "Casa", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setForm(f => ({ ...f, zip_code: formatted }));
    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      const data = await lookupCep(cleanCep);
      if (data) {
        setForm(f => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
          complement: data.complemento || f.complement,
        }));
        toast.success("Endereço preenchido automaticamente!");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase.from("addresses").update({ ...form }).eq("id", editingId);
      if (error) toast.error("Erro ao atualizar endereço");
      else toast.success("Endereço atualizado!");
    } else {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
      if (error) toast.error("Erro ao salvar endereço");
      else toast.success("Endereço adicionado!");
    }
    resetForm();
    fetchAddresses();
  };

  const handleEdit = (addr: Address) => {
    setForm({
      label: addr.label || "Casa",
      street: addr.street,
      number: addr.number,
      complement: addr.complement || "",
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast.success("Endereço removido");
    fetchAddresses();
  };

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  if (loading) return <div className="text-center py-12 text-muted-foreground font-body">Carregando...</div>;

  return (
    <div>
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="mb-6 gap-2">
          <Plus size={16} /> Adicionar Endereço
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4 max-w-lg">
          <h3 className="font-display text-lg font-bold">{editingId ? "Editar" : "Novo"} Endereço</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Rótulo</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={inputClass} placeholder="Casa, Trabalho..." />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">CEP</label>
              <div className="relative">
                <input
                  required
                  value={form.zip_code}
                  onChange={e => handleCepChange(e.target.value)}
                  className={inputClass}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {cepLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent" />}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-body font-medium text-foreground block mb-1">Rua</label>
              <input required value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Número</label>
              <input required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-sm font-body font-medium text-foreground block mb-1">Complemento</label>
            <input value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} className={inputClass} placeholder="Apto, Bloco..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Bairro</label>
              <input required value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Cidade</label>
              <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">UF</label>
              <input required maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} className={inputClass} placeholder="SP" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="gradient-gold text-primary-foreground font-body font-semibold h-11">Salvar</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-body">Nenhum endereço cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-card rounded-xl border border-border p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-sm font-semibold text-foreground">{addr.label || "Endereço"}</span>
                  {addr.is_default && <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-body font-semibold">Principal</span>}
                </div>
                <p className="text-sm text-muted-foreground font-body">
                  {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""}
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  {addr.neighborhood} - {addr.city}/{addr.state} · {addr.zip_code}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(addr)} className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
