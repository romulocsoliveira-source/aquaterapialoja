import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Aguardando Pagamento", color: "text-yellow-400" },
  paid: { label: "Pagamento Aprovado", color: "text-green-400" },
  preparing: { label: "Em Separação", color: "text-blue-400" },
  shipped: { label: "Enviado", color: "text-purple-400" },
  delivered: { label: "Entregue", color: "text-emerald-400" },
  cancelled: { label: "Cancelado", color: "text-destructive" },
};

export default function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return <div className="text-center py-12 text-muted-foreground font-body">Carregando...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-body">Você ainda não fez nenhum pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const st = statusLabels[order.status] || { label: order.status, color: "text-muted-foreground" };
        return (
          <div key={order.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-muted-foreground font-body">Pedido #{order.id.slice(0, 8)}</span>
                <p className="text-xs text-muted-foreground font-body">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className={`text-xs font-semibold font-body ${st.color}`}>{st.label}</span>
            </div>
            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product_image && <img src={item.product_image} alt="" className="w-12 h-14 object-cover rounded" />}
                  <div className="flex-1">
                    <p className="text-sm font-body font-medium text-foreground">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground font-body">Qtd: {item.quantity} · {formatPrice(item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground font-body">Total</span>
              <span className="font-display font-bold text-accent">{formatPrice(order.total)}</span>
            </div>
            {order.tracking_code && (
              <p className="text-xs text-muted-foreground font-body mt-2">Rastreio: <span className="text-accent">{order.tracking_code}</span></p>
            )}
          </div>
        );
      })}
    </div>
  );
}
