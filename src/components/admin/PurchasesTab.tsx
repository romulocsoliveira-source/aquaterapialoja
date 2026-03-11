import { useState } from "react";
import {
  ShoppingCart, Plus, Check, X, Clock, Truck, Package, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useStoreData";
import {
  usePurchases, useCreatePurchase, useCreatePurchaseItems, useReceivePurchase,
  useSuppliers,
} from "@/hooks/useSuppliers";

interface FormItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

const statusLabels: Record<string, string> = { pending: "Pendente", received: "Recebida", cancelled: "Cancelada" };
const statusColors: Record<string, string> = { pending: "bg-yellow-500/20 text-yellow-400", received: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400" };

export default function PurchasesTab() {
  const { user } = useAuth();
  const { data: purchases = [], isLoading } = usePurchases();
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const createPurchase = useCreatePurchase();
  const createItems = useCreatePurchaseItems();
  const receivePurchase = useReceivePurchase();

  const [formOpen, setFormOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<FormItem[]>([]);
  const [searchProduct, setSearchProduct] = useState("");

  const resetForm = () => { setSupplierId(""); setNotes(""); setItems([]); setSearchProduct(""); };

  const addItem = (p: typeof products[number]) => {
    if (items.find(i => i.product_id === p.id)) return;
    setItems(prev => [...prev, { product_id: p.id, product_name: p.name, quantity: 1, unit_cost: 0 }]);
    setSearchProduct("");
  };

  const updateItem = (idx: number, field: keyof FormItem, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  const handleSubmit = async () => {
    if (!supplierId || items.length === 0) {
      toast.error("Selecione fornecedor e adicione produtos");
      return;
    }
    const supplier = suppliers.find(s => s.id === supplierId);
    try {
      const purchase = await createPurchase.mutateAsync({
        supplier_id: supplierId,
        supplier_name: supplier?.name || "Desconhecido",
        total,
        status: "pending",
        notes: notes || null,
        purchased_at: new Date().toISOString(),
        received_at: null,
        created_by: user?.id || "",
      });
      await createItems.mutateAsync(items.map(i => ({
        purchase_id: purchase.id,
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
      })));
      toast.success("Compra registrada!");
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReceive = async (id: string) => {
    if (!confirm("Confirmar recebimento? O estoque será atualizado automaticamente.")) return;
    try {
      await receivePurchase.mutateAsync(id);
      toast.success("Compra recebida! Estoque atualizado.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filteredProducts = searchProduct
    ? products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.sku.toLowerCase().includes(searchProduct.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">{purchases.length}</p>
            <p className="text-xs text-muted-foreground">Total de Compras</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{purchases.filter(p => p.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{formatCurrency(purchases.filter(p => p.status === "received").reduce((s, p) => s + p.total, 0))}</p>
            <p className="text-xs text-muted-foreground">Total Recebido</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }} className="gradient-purple-pink text-primary-foreground font-body text-sm gap-2">
          <Plus size={16} /> Nova Compra
        </Button>
      </div>

      {/* Purchases list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhuma compra registrada. Registre sua primeira compra!</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground">Fornecedor</th>
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Total</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-accent" />
                        <div>
                          <p className="font-medium">{p.supplier_name}</p>
                          {p.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {new Date(p.purchased_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 text-right font-bold">{formatCurrency(p.total)}</td>
                    <td className="p-3 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleReceive(p.id)} className="text-xs gap-1 border-green-500/50 text-green-400 hover:bg-green-500/10">
                          <Check size={12} /> Receber
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Purchase Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Compra de Mercadoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="NF, pedido, etc." />
              </div>
            </div>

            {/* Add products */}
            <div className="space-y-2">
              <Label>Adicionar Produtos</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={searchProduct} onChange={e => setSearchProduct(e.target.value)} placeholder="Buscar produto por nome ou SKU..." className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground" />
              </div>
              {filteredProducts.length > 0 && (
                <div className="bg-secondary rounded-lg max-h-40 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addItem(p)} className="w-full flex items-center gap-3 p-2 hover:bg-border/50 transition-colors text-left text-sm">
                      <Package size={14} className="text-accent" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items table */}
            {items.length > 0 && (
              <div className="bg-secondary rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-xs text-muted-foreground">Produto</th>
                      <th className="text-center p-2 text-xs text-muted-foreground w-24">Qtd</th>
                      <th className="text-center p-2 text-xs text-muted-foreground w-32">Custo Unit.</th>
                      <th className="text-right p-2 text-xs text-muted-foreground w-28">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2 text-sm truncate max-w-[200px]">{item.product_name}</td>
                        <td className="p-2"><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 text-center text-sm" /></td>
                        <td className="p-2"><Input type="number" step="0.01" min={0} value={item.unit_cost} onChange={e => updateItem(idx, "unit_cost", Number(e.target.value))} className="h-8 text-center text-sm" /></td>
                        <td className="p-2 text-right font-bold text-sm">{formatCurrency(item.quantity * item.unit_cost)}</td>
                        <td className="p-2"><button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center p-3 border-t border-border">
                  <span className="text-sm font-body font-semibold">Total da Compra</span>
                  <span className="text-lg font-bold text-accent">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createPurchase.isPending} className="gradient-purple-pink text-primary-foreground">
                {createPurchase.isPending ? "Salvando..." : "Registrar Compra"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
