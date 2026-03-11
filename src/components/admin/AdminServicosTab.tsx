import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao: string | null;
  ativo: boolean;
}

const emptyForm = { nome: "", descricao: "", preco: 0, duracao: "1h", ativo: true };

export default function AdminServicosTab() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("servicos").select("*").order("nome");
    setServicos((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setForm(emptyForm); setEditing(null); setDialogOpen(true); };
  const openEdit = (s: Servico) => {
    setForm({ nome: s.nome, descricao: s.descricao || "", preco: s.preco, duracao: s.duracao || "1h", ativo: s.ativo });
    setEditing(s.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    setSaving(true);
    const payload = { nome: form.nome.trim(), descricao: form.descricao.trim() || null, preco: Number(form.preco), duracao: form.duracao, ativo: form.ativo };
    if (editing) {
      const { error } = await supabase.from("servicos").update(payload as any).eq("id", editing);
      if (error) toast.error(error.message);
      else toast.success("Serviço atualizado!");
    } else {
      const { error } = await supabase.from("servicos").insert(payload as any);
      if (error) toast.error(error.message);
      else toast.success("Serviço criado!");
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir serviço?")) return;
    const { error } = await supabase.from("servicos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Serviço excluído"); fetchData(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Serviços (Banho & Tosa)</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Serviço</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Carregando...</p>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-right p-3 font-medium">Preço</th>
              <th className="text-center p-3 font-medium">Duração</th>
              <th className="text-center p-3 font-medium">Ativo</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr></thead>
            <tbody className="divide-y">
              {servicos.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{s.nome}</td>
                  <td className="p-3 text-right">R$ {Number(s.preco).toFixed(2)}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.duracao}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {s.ativo ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {servicos.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum serviço</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} /></div>
              <div><Label>Duração</Label><Input value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={v => setForm({ ...form, ativo: v })} />
              <Label>Serviço ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
