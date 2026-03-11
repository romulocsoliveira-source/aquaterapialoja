import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Monitor, MessageCircle, Package, RefreshCw, Smartphone, Store } from "lucide-react";

type Channel = "Loja Online" | "WhatsApp" | "Mercado Livre" | "PDV";
type ShippingAddress = Record<string, string | undefined> | null;

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_image: string | null;
  variation: string | null;
};

type OrderRecord = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string | null;
  shipping_address: ShippingAddress;
  tracking_code: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
  customer_name: string | null;
  customer_phone: string | null;
};

const CHANNELS: Channel[] = ["Loja Online", "WhatsApp", "Mercado Livre", "PDV"];

const channelIcons: Record<Channel, React.ReactNode> = {
  "Loja Online": <Monitor size={14} />,
  "WhatsApp": <MessageCircle size={14} />,
  "Mercado Livre": <Store size={14} />,
  PDV: <Smartphone size={14} />,
};

const channelColors: Record<Channel, string> = {
  "Loja Online": "bg-accent/20 text-accent",
  "WhatsApp": "bg-secondary text-foreground",
  "Mercado Livre": "bg-secondary text-foreground",
  PDV: "bg-secondary text-foreground",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Aguardando Pagamento", color: "text-muted-foreground" },
  paid: { label: "Pagamento Aprovado", color: "text-accent" },
  preparing: { label: "Em Separação", color: "text-foreground" },
  processing: { label: "Em Separação", color: "text-foreground" },
  shipped: { label: "Enviado", color: "text-foreground" },
  delivered: { label: "Entregue", color: "text-accent" },
  completed: { label: "Finalizado", color: "text-accent" },
  cancelled: { label: "Cancelado", color: "text-destructive" },
};

function getChannel(method: string | null): Channel {
  if (!method) return "Loja Online";
  if (method.startsWith("pdv") || method === "cash" || method === "debit_card") return "PDV";
  if (method.includes("mercado")) return "Mercado Livre";
  if (method.includes("whatsapp")) return "WhatsApp";
  return "Loja Online";
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatAddress(address: ShippingAddress) {
  if (!address) return "Retirada / sem endereço";

  const firstLine = [address.street, address.number].filter(Boolean).join(", ");
  const secondLine = [address.complement, address.neighborhood].filter(Boolean).join(" • ");
  const cityLine = [address.city, address.state].filter(Boolean).join("/");

  return [firstLine, secondLine, cityLine, address.zip_code].filter(Boolean).join(" — ");
}

export default function OrdersCentralTab() {
  const [channelFilter, setChannelFilter] = useState<string>("Todos");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, user_id, total, status, payment_method, shipping_address, tracking_code, created_at, order_items(id, product_name, quantity, unit_price, product_image, variation)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (ordersError) throw ordersError;

      const userIds = [...new Set((ordersData || []).map((order) => order.user_id))];
      let profilesMap = new Map<string, { full_name: string | null; phone: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        profilesMap = new Map(
          (profiles || []).map((profile) => [profile.user_id, { full_name: profile.full_name, phone: profile.phone }]),
        );
      }

      setOrders(
        ((ordersData || []) as any[]).map((order) => ({
          ...order,
          shipping_address: (order.shipping_address as ShippingAddress) || null,
          customer_name: profilesMap.get(order.user_id)?.full_name || null,
          customer_phone: profilesMap.get(order.user_id)?.phone || null,
        })) as OrderRecord[],
      );
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar Central de Pedidos");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, loadOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mappedOrders = useMemo(() => {
    return orders.map((order) => {
      const channel = getChannel(order.payment_method);
      const statusInfo = statusLabels[order.status] || { label: order.status, color: "text-muted-foreground" };
      const items = order.order_items || [];
      const itemsCount = items.reduce((total, item) => total + item.quantity, 0);

      const city = (order.shipping_address as any)?.city || "—";

      return {
        ...order,
        orderLabel: `#${order.id.slice(0, 8).toUpperCase()}`,
        customer: order.customer_name || "Cliente não identificado",
        phone: order.customer_phone || "—",
        city,
        address: formatAddress(order.shipping_address),
        dateTime: new Date(order.created_at).toLocaleString("pt-BR"),
        totalLabel: formatCurrency(Number(order.total)),
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color,
        channel,
        items,
        itemsCount,
      };
    });
  }, [orders]);

  const filtered = useMemo(
    () => (channelFilter === "Todos" ? mappedOrders : mappedOrders.filter((order) => order.channel === channelFilter)),
    [channelFilter, mappedOrders],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {["Todos", ...CHANNELS].map((channel) => (
            <button
              key={channel}
              onClick={() => setChannelFilter(channel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
                channelFilter === channel ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {channel !== "Todos" && channelIcons[channel as Channel]}
              {channel}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={loadOrders} disabled={loadingOrders} className="gap-1 text-xs">
          <RefreshCw size={14} className={loadingOrders ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Pedido</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden lg:table-cell">Telefone</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden lg:table-cell">Cidade</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Pagamento</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden lg:table-cell">Data e hora</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Total</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">Carregando pedidos...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado</td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <>
                      <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 align-top">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="flex items-start gap-2 text-left"
                          >
                            {isExpanded ? <ChevronUp size={16} className="mt-0.5 text-muted-foreground" /> : <ChevronDown size={16} className="mt-0.5 text-muted-foreground" />}
                            <div>
                              <p className="font-bold">{order.orderLabel}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${channelColors[order.channel]}`}>
                                  {channelIcons[order.channel]} {order.channel}
                                </span>
                                <span>{order.itemsCount} item(ns)</span>
                              </div>
                            </div>
                          </button>
                        </td>
                        <td className="p-3 hidden md:table-cell align-top">{order.customer}</td>
                        <td className="p-3 hidden lg:table-cell align-top text-muted-foreground">{order.phone}</td>
                        <td className="p-3 hidden xl:table-cell align-top text-muted-foreground max-w-[280px]">{order.address}</td>
                        <td className="p-3 hidden md:table-cell align-top text-muted-foreground text-xs">{order.payment_method || "—"}</td>
                        <td className="p-3 hidden lg:table-cell align-top text-muted-foreground">{order.dateTime}</td>
                        <td className="p-3 text-right align-top font-bold">{order.totalLabel}</td>
                        <td className="p-3 text-right align-top">
                          <span className={`text-xs font-semibold ${order.statusColor}`}>{order.statusLabel}</span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${order.id}-details`} className="border-b border-border/50 bg-secondary/20">
                          <td colSpan={8} className="p-4">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itens do pedido</p>
                                  <div className="mt-2 space-y-2">
                                    {order.items.length === 0 ? (
                                      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                                        Nenhum item vinculado ao pedido.
                                      </div>
                                    ) : (
                                      order.items.map((item) => {
                                        const subtotal = item.quantity * Number(item.unit_price);
                                        return (
                                          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3">
                                            {item.product_image ? (
                                              <img src={item.product_image} alt={item.product_name} className="h-12 w-12 rounded object-cover" />
                                            ) : (
                                              <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary text-muted-foreground">
                                                <Package size={16} />
                                              </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <p className="truncate font-medium">{item.product_name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                Qtd: {item.quantity} • Unitário: {formatCurrency(Number(item.unit_price))}
                                                {item.variation ? ` • Variação: ${item.variation}` : ""}
                                              </p>
                                            </div>
                                            <div className="text-right text-sm font-semibold">{formatCurrency(subtotal)}</div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados do pedido</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Cliente</span>
                                    <span className="text-right font-medium">{order.customer}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Telefone</span>
                                    <span className="text-right font-medium">{order.phone}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Pagamento</span>
                                    <span className="text-right font-medium">{order.payment_method || "—"}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`text-right font-medium ${order.statusColor}`}>{order.statusLabel}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Data e hora</span>
                                    <span className="text-right font-medium">{order.dateTime}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Rastreio</span>
                                    <span className="text-right font-medium">{order.tracking_code || "—"}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground">Endereço</span>
                                    <span className="text-right font-medium max-w-[220px]">{order.address}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-3 border-t border-border pt-2">
                                    <span className="text-muted-foreground">Valor total</span>
                                    <span className="text-right font-semibold text-accent">{order.totalLabel}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">{filtered.length} pedido(s)</div>
      </div>
    </div>
  );
}
