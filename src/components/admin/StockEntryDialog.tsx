import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import type { Product } from "@/data/products";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export default function StockEntryDialog({ open, onOpenChange, product }: Props) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState("1");
  const [costPrice, setCostPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [saving, setSaving] = useState(false);

  if (!product) return null;

  const handleSave = async () => {
    const qty = Number(quantity);
    if (qty <= 0) { toast.error("Quantidade inválida"); return; }

    setSaving(true);
    try {
      const newStock = (product.stock || 0) + qty;
      const { error } = await supabase.from("store_products").update({ stock: newStock }).eq("id", product.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      toast.success(`Estoque de "${product.name}" atualizado: +${qty} unidades (total: ${newStock})`);
      onOpenChange(false);
      setQuantity("1");
      setCostPrice("");
      setSupplier("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar estoque");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={18} className="text-primary" /> Entrada de Estoque
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-secondary rounded-lg p-3">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku} · Cód: {product.barcode}</p>
              <p className="text-xs text-muted-foreground">Estoque atual: <strong>{product.stock}</strong></p>
            </div>
          </div>

          <div>
            <Label>Quantidade *</Label>
            <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label>Valor de Custo (R$)</Label>
            <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Label>Fornecedor</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nome do fornecedor" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1">
              <Plus size={14} /> {saving ? "Salvando..." : "Confirmar Entrada"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
