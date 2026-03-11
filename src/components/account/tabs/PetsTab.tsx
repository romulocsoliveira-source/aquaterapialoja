import { useState, useEffect } from "react";
import { PawPrint, Plus, Pencil, Trash2, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade: string | null;
  peso: string | null;
  observacoes: string | null;
}

const SPECIES = ["Cão", "Gato", "Peixe", "Outro"];

export default function PetsTab() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cão");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const fetchPets = async () => {
    if (!user) return;
    const { data } = await supabase.from("pets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setPets((data as Pet[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPets(); }, [user]);

  const resetForm = () => {
    setNome(""); setEspecie("Cão"); setRaca(""); setIdade(""); setPeso(""); setObservacoes("");
    setEditing(null); setShowForm(false);
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    setNome(pet.nome);
    setEspecie(pet.especie);
    setRaca(pet.raca || "");
    setIdade(pet.idade || "");
    setPeso(pet.peso || "");
    setObservacoes(pet.observacoes || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !nome.trim()) { toast.error("Informe o nome do pet"); return; }
    setSaving(true);

    const payload = {
      nome: nome.trim(),
      especie,
      raca: raca.trim() || null,
      idade: idade.trim() || null,
      peso: peso.trim() || null,
      observacoes: observacoes.trim() || null,
      user_id: user.id,
    };

    if (editing) {
      const { error } = await supabase.from("pets").update(payload).eq("id", editing.id);
      if (error) toast.error("Erro ao atualizar: " + error.message);
      else toast.success("Pet atualizado!");
    } else {
      const { error } = await supabase.from("pets").insert(payload as any);
      if (error) toast.error("Erro ao cadastrar: " + error.message);
      else toast.success("Pet cadastrado!");
    }

    setSaving(false);
    resetForm();
    fetchPets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir: " + error.message);
    else { toast.success("Pet removido"); fetchPets(); }
  };

  const speciesEmoji = (s: string) => {
    if (s === "Cão") return "🐕";
    if (s === "Gato") return "🐱";
    if (s === "Peixe") return "🐟";
    return "🐾";
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-primary" /> Meus Pets
        </h2>
        {!showForm && (
          <Button size="sm" className="gradient-pet text-primary-foreground gap-1" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={14} /> Cadastrar Pet
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm">{editing ? "Editar Pet" : "Novo Pet"}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Pet *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Rex" className="mt-1" />
            </div>
            <div>
              <Label>Espécie *</Label>
              <select
                value={especie}
                onChange={e => setEspecie(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Raça</Label>
              <Input value={raca} onChange={e => setRaca(e.target.value)} placeholder="Ex: Golden Retriever" className="mt-1" />
            </div>
            <div>
              <Label>Idade</Label>
              <Input value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 3 anos" className="mt-1" />
            </div>
            <div>
              <Label>Peso</Label>
              <Input value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 15kg" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Alergias, medicamentos, comportamento..."
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[70px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="gradient-pet text-primary-foreground gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? "Salvar Alterações" : "Cadastrar Pet"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {pets.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum pet cadastrado ainda.</p>
          <p className="text-xs mt-1">Cadastre seus pets para agendar Banho & Tosa e Hotel Pet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pets.map(pet => (
            <div key={pet.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                {speciesEmoji(pet.especie)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{pet.nome}</h4>
                <p className="text-xs text-muted-foreground">
                  {pet.especie}{pet.raca ? ` • ${pet.raca}` : ""}{pet.idade ? ` • ${pet.idade}` : ""}{pet.peso ? ` • ${pet.peso}` : ""}
                </p>
                {pet.observacoes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{pet.observacoes}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(pet)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(pet.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
