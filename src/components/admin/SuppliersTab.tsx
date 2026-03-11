import { useState } from "react";
import {
  Truck, Plus, Edit, Trash2, Phone, Mail, MapPin, Search, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
  type Supplier,
} from "@/hooks/useSuppliers";

export default function SuppliersTab() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const createMut = useCreateSupplier();
  const updateMut = useUpdateSupplier();
  const deleteMut = useDeleteSupplier();

  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const resetForm = () => setForm({ name: "", phone: "", email: "", address: "", notes: "" });

  const openNew = () => { resetForm(); setEditing(null); setFormOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone || "", email: s.email || "", address: s.address || "", notes: s.notes || "" });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Nome é obrigatório"); return; }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, name: form.name, phone: form.phone || null, email: form.email || null, address: form.address || null, notes: form.notes || null });
        toast.success("Fornecedor atualizado!");
      } else {
        await createMut.mutateAsync({ name: form.name, phone: form.phone || null, email: form.email || null, address: form.address || null, notes: form.notes || null, is_active: true });
        toast.success("Fornecedor cadastrado!");
      }
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Excluir fornecedor "${s.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(s.id);
      toast.success("Fornecedor excluído");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar fornecedor..." className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground" />
        </div>
        <Button onClick={openNew} className="gradient-purple-pink text-primary-foreground font-body text-sm gap-2">
          <Plus size={16} /> Novo Fornecedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">{suppliers.length}</p>
          <p className="text-xs text-muted-foreground">Total de Fornecedores</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{suppliers.filter(s => s.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Ativos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{suppliers.filter(s => !s.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Inativos</p>
        </div>
      </div>

      {/* Suppliers list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Truck size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum fornecedor cadastrado. Adicione seu primeiro fornecedor!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Truck size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold">{s.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {s.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(s)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {s.phone && <p className="flex items-center gap-2"><Phone size={12} /> {s.phone}</p>}
                {s.email && <p className="flex items-center gap-2"><Mail size={12} /> {s.email}</p>}
                {s.address && <p className="flex items-center gap-2"><MapPin size={12} /> {s.address}</p>}
                {s.notes && <p className="flex items-center gap-2"><Package size={12} /> {s.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do fornecedor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@fornecedor.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Endereço completo" />
            </div>
            <div className="space-y-2">
              <Label>Observações / Produtos fornecidos</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Produtos fornecidos, condições, etc." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="gradient-purple-pink text-primary-foreground">
                {(createMut.isPending || updateMut.isPending) ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
