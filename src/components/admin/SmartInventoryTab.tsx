import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Package, ShoppingBag, ArrowDown, ArrowUp, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STOCK_MIN = 10;
const STOCK_IDEAL = 30;

export default function SmartInventoryTab() {
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const [activeReport, setActiveReport] = useState<"low" | "reorder" | "stale" | "best">("low");

  const lowStock = useMemo(() =>
    products.filter(p => (p.stock || 0) <= STOCK_MIN).sort((a, b) => (a.stock || 0) - (b.stock || 0))
  , [products]);

  const reorderList = useMemo(() =>
    products
      .filter(p => (p.stock || 0) < STOCK_IDEAL)
      .map(p => ({ ...p, toOrder: STOCK_IDEAL - (p.stock || 0) }))
      .sort((a, b) => b.toOrder - a.toOrder)
  , [products]);

  const staleProducts = useMemo(() =>
    products.filter(p => (p.stock || 0) > 20 && (p.reviews || 0) < 3).sort((a, b) => (b.stock || 0) - (a.stock || 0))
  , [products]);

  const bestSellers = useMemo(() =>
    [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 10)
  , [products]);

  const stats = [
    { label: "Estoque Normal", value: products.filter(p => (p.stock || 0) > STOCK_MIN).length, icon: Package, color: "text-green-400" },
    { label: "Estoque Baixo", value: lowStock.length, icon: AlertTriangle, color: "text-red-400" },
    { label: "Para Repor", value: reorderList.length, icon: ShoppingBag, color: "text-yellow-400" },
    { label: "Parados", value: staleProducts.length, icon: ArrowDown, color: "text-muted-foreground" },
  ];

  const reports = [
    { id: "low" as const, label: "Estoque Baixo", icon: AlertTriangle },
    { id: "reorder" as const, label: "Sugestão de Compra", icon: ShoppingBag },
    { id: "stale" as const, label: "Parados no Estoque", icon: ArrowDown },
    { id: "best" as const, label: "Mais Vendidos", icon: TrendingUp },
  ];

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const updateStock = async (productId: string, newStock: number) => {
    const { error } = await supabase.from("store_products").update({ stock: newStock }).eq("id", productId);
    if (error) { toast.error(error.message); return; }
    toast.success("Estoque atualizado!");
    queryClient.invalidateQueries({ queryKey: ["store-products"] });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4">
            <s.icon size={20} className={s.color} />
            <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-body font-semibold text-sm text-red-400">⚠️ {lowStock.length} produto(s) com estoque baixo!</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStock.slice(0, 3).map(p => p.name).join(", ")}{lowStock.length > 3 ? ` e mais ${lowStock.length - 3}...` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Report tabs */}
      <div className="flex gap-2 flex-wrap">
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body whitespace-nowrap transition-colors ${
              activeReport === r.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            <r.icon size={14} /> {r.label}
          </button>
        ))}
      </div>

      {/* Low Stock */}
      {activeReport === "low" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Estoque Atual</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Mínimo</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Ideal</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><div><p className="font-medium truncate max-w-[200px]">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku}</p></div></div></td>
                  <td className="p-3 text-right font-bold text-red-400">{p.stock}</td>
                  <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{STOCK_MIN}</td>
                  <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{STOCK_IDEAL}</td>
                  <td className="p-3 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${(p.stock || 0) < 5 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {(p.stock || 0) < 5 ? "Crítico" : "Baixo"}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum produto com estoque baixo 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Reorder Suggestions */}
      {activeReport === "reorder" && (
        <div className="space-y-4">
          <div className="bg-accent/5 border border-accent/30 rounded-xl p-4">
            <h3 className="font-body font-semibold text-sm mb-1">📋 Lista de Reposição Sugerida</h3>
            <p className="text-xs text-muted-foreground">Baseado no estoque ideal de {STOCK_IDEAL} unidades por produto</p>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Atual</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ideal</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Comprar</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Custo Est.</th>
                </tr>
              </thead>
              <tbody>
                {reorderList.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><span className="truncate max-w-[200px]">{p.name}</span></div></td>
                    <td className="p-3 text-right font-bold text-yellow-400">{p.stock}</td>
                    <td className="p-3 text-right text-muted-foreground">{STOCK_IDEAL}</td>
                    <td className="p-3 text-right font-bold text-accent">{p.toOrder} un</td>
                    <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{formatPrice(p.toOrder * (p.costPrice || p.price * 0.6))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right text-sm">
            <span className="text-muted-foreground">Custo total estimado de reposição: </span>
            <span className="font-bold text-accent">
              {formatPrice(reorderList.reduce((s, p) => s + p.toOrder * (p.costPrice || p.price * 0.6), 0))}
            </span>
          </div>
        </div>
      )}

      {/* Stale Products */}
      {activeReport === "stale" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Estoque</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Vendas</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Preço</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Sugestão</th>
              </tr>
            </thead>
            <tbody>
              {staleProducts.map(p => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><span className="truncate max-w-[200px]">{p.name}</span></div></td>
                  <td className="p-3 text-right font-bold">{p.stock}</td>
                  <td className="p-3 text-right text-muted-foreground">{p.reviews}</td>
                  <td className="p-3 text-right hidden md:table-cell">{formatPrice(p.promoPrice || p.price)}</td>
                  <td className="p-3 text-right"><span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Criar promoção</span></td>
                </tr>
              ))}
              {staleProducts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum produto parado 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Best Sellers */}
      {activeReport === "best" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">#</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Vendas</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Estoque</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Faturamento Est.</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((p, i) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-3 font-bold text-accent">{i + 1}º</td>
                  <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><span className="truncate max-w-[200px]">{p.name}</span></div></td>
                  <td className="p-3 text-right font-bold">{p.reviews}</td>
                  <td className="p-3 text-right"><span className={`font-bold ${(p.stock || 0) < 10 ? "text-red-400" : "text-green-400"}`}>{p.stock}</span></td>
                  <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{formatPrice((p.reviews || 0) * (p.promoPrice || p.price))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
