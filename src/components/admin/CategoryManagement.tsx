import { useState } from "react";
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CategoryForm {
  name: string;
  slug: string;
  image: string;
  parent: string;
}

const emptyForm: CategoryForm = { name: "", slug: "", image: "", parent: "" };

export default function CategoryManagement() {
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [loading, setLoading] = useState(false);

  const parentCategories = categories.filter(c => !c.parent);
  const getChildren = (parentName: string) => categories.filter(c => c.parent === parentName);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.slug);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || "", parent: cat.parent || "" });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Nome e slug são obrigatórios");
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      image: form.image.trim() || null,
      parent: form.parent || null,
    };

    try {
      if (editingId) {
        // Find actual DB id
        const { data: existing } = await supabase.from("store_categories").select("id").eq("slug", editingId).single();
        if (!existing) throw new Error("Categoria não encontrada");
        const { error } = await supabase.from("store_categories").update(payload).eq("id", existing.id);
        if (error) throw error;
        toast.success("Categoria atualizada!");
      } else {
        const { error } = await supabase.from("store_categories").insert(payload);
        if (error) throw error;
        toast.success("Categoria criada!");
      }
      queryClient.invalidateQueries({ queryKey: ["store-categories"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Excluir a categoria "${name}"? Produtos vinculados não serão removidos.`)) return;
    const { data: existing } = await supabase.from("store_categories").select("id").eq("slug", slug).single();
    if (!existing) { toast.error("Categoria não encontrada"); return; }
    const { error } = await supabase.from("store_categories").delete().eq("id", existing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria excluída");
    queryClient.invalidateQueries({ queryKey: ["store-categories"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-body font-semibold text-sm flex items-center gap-2">
          <FolderTree size={16} className="text-accent" /> Categorias ({categories.length})
        </h3>
        <Button onClick={openNew} variant="outline" size="sm" className="gap-2 text-xs">
          <Plus size={14} /> Nova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-secondary/50 rounded-xl p-8 text-center">
          <FolderTree size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada</p>
          <Button onClick={openNew} variant="outline" size="sm" className="mt-3 gap-2 text-xs">
            <Plus size={14} /> Criar primeira categoria
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Categoria</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Slug</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Pai</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Produtos</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {parentCategories.map(cat => (
                <>
                  <tr key={cat.slug} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                            <ImageIcon size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{cat.slug}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">—</td>
                    <td className="p-3 text-right">{cat.count}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(cat.slug, cat.name)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                  {getChildren(cat.name).map(sub => (
                    <tr key={sub.slug} className="border-b border-border/50 hover:bg-secondary/30 bg-secondary/10">
                      <td className="p-3 pl-10">
                        <div className="flex items-center gap-3">
                          {sub.image ? (
                            <img src={sub.image} alt={sub.name} className="w-7 h-7 rounded object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
                              <ImageIcon size={12} className="text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-sm">↳ {sub.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{sub.slug}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{sub.parent}</td>
                      <td className="p-3 text-right">{sub.count}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(sub)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(sub.slug, sub.name)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
              {/* Orphan categories (no parent but also not parents themselves — shouldn't happen normally) */}
              {categories.filter(c => c.parent && !parentCategories.find(p => p.name === c.parent)).map(cat => (
                <tr key={cat.slug} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        <ImageIcon size={14} className="text-muted-foreground" />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{cat.slug}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{cat.parent || "—"}</td>
                  <td className="p-3 text-right">{cat.count}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat.slug, cat.name)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ex: Rações" required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="racoes" />
            </div>
            <div className="space-y-2">
              <Label>Categoria Pai (opcional)</Label>
              <Select value={form.parent || "none"} onValueChange={v => setForm(f => ({ ...f, parent: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Nenhuma (raiz)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                  {parentCategories.filter(c => c.slug !== editingId).map(c => (
                    <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ImageUpload
              value={form.image}
              onChange={url => setForm(f => ({ ...f, image: url }))}
              label="Imagem da Categoria"
            />
            <div className="space-y-2">
              <Label>Ou cole uma URL de imagem</Label>
              <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="gradient-purple-pink text-primary-foreground">
                {editingId ? "Atualizar" : "Criar Categoria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
