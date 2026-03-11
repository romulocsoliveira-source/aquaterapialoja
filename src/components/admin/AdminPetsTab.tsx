import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PawPrint, Search, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminPetsTab() {
  const [pets, setPets] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("pets").select("*").order("created_at", { ascending: false });
    setPets((data as any[]) || []);

    if (data && data.length > 0) {
      const userIds = [...new Set((data as any[]).map((p: any) => p.user_id))];
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const pMap: Record<string, string> = {};
      profs?.forEach((p: any) => { pMap[p.user_id] = p.full_name || "Cliente"; });
      setProfiles(pMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = pets.filter((p: any) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.raca || "").toLowerCase().includes(search.toLowerCase()) ||
    (profiles[p.user_id] || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir pet?")) return;
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Pet excluído"); fetchData(); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <PawPrint className="w-6 h-6 text-primary" /> Cadastro de Pets
      </h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, raça ou dono..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Carregando...</p>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Pet</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Espécie</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Raça</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Idade</th>
              <th className="text-left p-3 font-medium">Dono</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <span>{p.especie === "Cão" ? "🐕" : p.especie === "Gato" ? "🐱" : "🐾"}</span>
                    {p.nome}
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{p.especie}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{p.raca || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{p.idade || "—"}</td>
                  <td className="p-3">{profiles[p.user_id] || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(p)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum pet encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Detalhes do Pet</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><strong>Nome:</strong> {selected.nome}</div>
              <div><strong>Espécie:</strong> {selected.especie}</div>
              <div><strong>Raça:</strong> {selected.raca || "—"}</div>
              <div><strong>Idade:</strong> {selected.idade || "—"}</div>
              <div><strong>Peso:</strong> {selected.peso || "—"}</div>
              <div><strong>Dono:</strong> {profiles[selected.user_id] || "—"}</div>
              <div><strong>Observações:</strong> {selected.observacoes || "—"}</div>
              <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
