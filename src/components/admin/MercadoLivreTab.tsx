import { useState } from "react";
import { Store, Package, RefreshCw, ShoppingCart, CheckCircle, Upload, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useStoreData";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function MercadoLivreTab() {
  const { data: products = [] } = useProducts();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [publishedProducts, setPublishedProducts] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const simulateAction = (action: string, productId?: string) => {
    setSyncing(action);
    setTimeout(() => {
      setSyncing(null);
      if (action === "publish" && productId) {
        setPublishedProducts(prev => new Set([...prev, productId]));
        toast.success("Produto enviado ao Mercado Livre com sucesso.");
      } else if (action === "sync-stock") {
        toast.success("Estoque sincronizado com o Mercado Livre.");
      } else if (action === "import-orders") {
        toast.success("Pedidos importados do Mercado Livre com sucesso.");
      } else if (action === "sync-prices") {
        toast.success("Preços sincronizados com o Mercado Livre.");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFE600]/20 flex items-center justify-center">
              <Store size={24} className="text-[#FFE600]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Mercado Livre</h2>
              <p className="text-xs text-muted-foreground">Integração demonstrativa · Almoxarifado das Tintas</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#FFE600]/20 text-[#FFE600]">
            Demo
          </span>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Esta é uma integração demonstrativa. As ações simulam o funcionamento real da integração com o Mercado Livre para apresentação ao cliente.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "sync-stock", label: "Sincronizar Estoque", icon: RefreshCw, desc: "Atualizar estoque no ML" },
          { id: "import-orders", label: "Importar Pedidos", icon: Download, desc: "Buscar novos pedidos" },
          { id: "sync-prices", label: "Sincronizar Preços", icon: Upload, desc: "Atualizar preços no ML" },
          { id: "publish-all", label: "Publicar Todos", icon: Package, desc: "Enviar catálogo" },
        ].map(action => (
          <button
            key={action.id}
            onClick={() => simulateAction(action.id)}
            disabled={syncing !== null}
            className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors text-left disabled:opacity-50"
          >
            <action.icon size={20} className={`mb-2 ${syncing === action.id ? "animate-spin text-accent" : "text-muted-foreground"}`} />
            <p className="text-sm font-semibold">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-body font-semibold flex items-center gap-2">
            <Package size={16} /> Produtos para Publicar ({products.length})
          </h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {products.slice(0, 20).map(p => {
            const isPublished = publishedProducts.has(p.id);
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0">
                <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded object-cover bg-secondary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {p.sku} · Estoque: {p.stock}</p>
                </div>
                <span className="text-sm font-bold text-accent whitespace-nowrap">
                  {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                {isPublished ? (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                    <CheckCircle size={14} /> Publicado
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => simulateAction("publish", p.id)}
                    disabled={syncing !== null}
                  >
                    {syncing === "publish" ? <RefreshCw size={12} className="animate-spin" /> : "Publicar"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Produtos Publicados", value: publishedProducts.size, icon: Package },
          { label: "Pedidos Importados", value: 0, icon: ShoppingCart },
          { label: "Última Sincronização", value: "Agora", icon: RefreshCw },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <stat.icon size={20} className="mx-auto mb-2 text-accent" />
            <p className="text-xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
