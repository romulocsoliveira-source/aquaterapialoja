import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, CheckCircle, Clock, AlertCircle, Navigation, Phone, Package, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type DeliveryStatus = "pending" | "in_transit" | "delivered";

interface Delivery {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  address: string;
  neighborhood: string;
  total: string;
  status: DeliveryStatus;
  items: number;
  createdAt: string;
  lat: number;
  lng: number;
}

const statusConfig: Record<DeliveryStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: "Pendente", color: "text-red-400", bgColor: "bg-red-500", icon: AlertCircle },
  in_transit: { label: "Em Entrega", color: "text-yellow-400", bgColor: "bg-yellow-500", icon: Truck },
  delivered: { label: "Entregue", color: "text-green-400", bgColor: "bg-green-500", icon: CheckCircle },
};

const DEFAULT_STORE = {
  name: "Aquaterapia Pet Shop",
  phone: "(18) 99657-0512",
  street: "Avenida Getúlio Vargas, 339",
  neighborhood: "Vila Nova Santana",
  cityState: "Assis - SP",
  zipCode: "19807-130",
  lat: -22.6617,
  lng: -50.4122,
};

const statusColors: Record<DeliveryStatus, string> = {
  pending: "#ef4444",
  in_transit: "#eab308",
  delivered: "#22c55e",
};

const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:24px;height:24px;border-radius:999px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

function mapOrderStatus(status: string): DeliveryStatus {
  switch (status) {
    case "delivered":
    case "completed":
      return "delivered";
    case "shipped":
    case "in_transit":
      return "in_transit";
    default:
      return "pending";
  }
}

export default function DeliveryMapTab() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, total, status, payment_method, shipping_address, created_at, user_id, discount, shipping_cost")
        .not("shipping_address", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get profiles for customer names
      const userIds = [...new Set((orders || []).map(o => o.user_id))];
      let profilesMap: Record<string, { full_name: string | null; phone: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", userIds);
        if (profiles) {
          profiles.forEach(p => { profilesMap[p.user_id] = { full_name: p.full_name, phone: p.phone }; });
        }
      }

      // Get order item counts
      const orderIds = (orders || []).map(o => o.id);
      let itemCounts: Record<string, number> = {};
      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from("order_items")
          .select("order_id, quantity")
          .in("order_id", orderIds);
        if (items) {
          items.forEach(i => { itemCounts[i.order_id] = (itemCounts[i.order_id] || 0) + i.quantity; });
        }
      }

      const mapped: Delivery[] = (orders || []).map((o, idx) => {
        const addr = o.shipping_address as any;
        const profile = profilesMap[o.user_id];
        const addressStr = addr ? `${addr.street || ''}, ${addr.number || ''}${addr.complement ? ` - ${addr.complement}` : ''}` : 'Endereço não informado';
        const neighborhoodStr = addr?.neighborhood || '';

        // Approximate coordinates based on order index (since we don't have geocoding)
        // Spread around the store location
        const angle = (idx * 137.5) * (Math.PI / 180); // golden angle for distribution
        const dist = 0.003 + (idx % 5) * 0.002;
        const lat = STORE.lat + Math.cos(angle) * dist;
        const lng = STORE.lng + Math.sin(angle) * dist;

        return {
          id: o.id,
          orderId: `#${o.id.slice(0, 6).toUpperCase()}`,
          customer: profile?.full_name || "Cliente",
          phone: profile?.phone || "",
          address: addressStr,
          neighborhood: neighborhoodStr,
          total: Number(o.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          status: mapOrderStatus(o.status),
          items: itemCounts[o.id] || 0,
          createdAt: new Date(o.created_at).toLocaleString("pt-BR"),
          lat,
          lng,
        };
      });

      setDeliveries(mapped);
    } catch (err) {
      console.error("Error loading deliveries:", err);
      toast.error("Erro ao carregar entregas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();

    const channel = supabase
      .channel("delivery-map-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadDeliveries)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, loadDeliveries)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadDeliveries)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDeliveries]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? deliveries : deliveries.filter((d) => d.status === statusFilter)),
    [deliveries, statusFilter],
  );

  const counts = useMemo(
    () => ({
      pending: deliveries.filter((d) => d.status === "pending").length,
      in_transit: deliveries.filter((d) => d.status === "in_transit").length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
    }),
    [deliveries],
  );

  const updateStatus = async (id: string, newStatus: DeliveryStatus) => {
    const dbStatus = newStatus === "in_transit" ? "shipped" : newStatus === "delivered" ? "delivered" : "pending_payment";
    await supabase.from("orders").update({ status: dbStatus }).eq("id", id);
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    const labels: Record<DeliveryStatus, string> = { pending: "pendente", in_transit: "em entrega", delivered: "entregue" };
    toast.success(`Pedido marcado como ${labels[newStatus]}`);
  };

  const openRoute = (address: string) => {
    const origin = encodeURIComponent(`${STORE.street}, ${STORE.neighborhood}, ${STORE.cityState}, ${STORE.zipCode}`);
    const destination = encodeURIComponent(`${address}, Assis, SP`);
    window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button variant="outline" size="sm" onClick={loadDeliveries} disabled={loading} className="gap-1 text-xs">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(counts) as [DeliveryStatus, number][]).map(([status, count]) => {
          const cfg = statusConfig[status];
          return (
            <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 text-center">
              <cfg.icon size={24} className={`${cfg.color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-body font-semibold flex items-center gap-2">
            <MapPin size={18} className="text-primary" /> Mapa de Entregas — Assis, SP
          </h3>
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.google.com/maps/place/Avenida+Get%C3%BAlio+Vargas,+339,+Assis+-+SP", "_blank")} className="text-xs gap-1">
            <Navigation size={14} /> Abrir no Google Maps
          </Button>
        </div>

        {mapError && (
          <div className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Não foi possível carregar o provedor de mapa.
          </div>
        )}

        {deliveries.length === 0 && !loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Nenhum pedido com endereço de entrega encontrado.
          </div>
        ) : (
          <div style={{ height: 420 }}>
            <MapContainer center={[STORE.lat, STORE.lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <MapAutoResize />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  tileerror: () => setMapError("tile-error"),
                  load: () => setMapError(null),
                }}
              />

              <Marker position={[STORE.lat, STORE.lng]} icon={createIcon("hsl(199, 89%, 48%)")}>
                <Popup>
                  <strong>{STORE.name}</strong><br />
                  {STORE.street}<br />
                  {STORE.neighborhood} — {STORE.cityState}<br />
                  CEP {STORE.zipCode}<br />
                  Tel: {STORE.phone}
                </Popup>
              </Marker>

              {filtered.map((d) => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={createIcon(statusColors[d.status])} eventHandlers={{ click: () => setSelectedDelivery(d) }}>
                  <Popup>
                    <strong>{d.orderId}</strong> — {d.customer}<br />
                    {d.address}<br />
                    <strong>{d.total}</strong>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="p-3 border-t border-border flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(199, 89%, 48%)" }} />
            <span className="text-muted-foreground">Loja</span>
          </div>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: statusColors[key as DeliveryStatus] }} />
              <span className="text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ id: "all", label: "Todos" }, ...Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${statusFilter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {f.label} {f.id !== "all" && `(${counts[f.id as DeliveryStatus]})`}
          </button>
        ))}
      </div>

      {selectedDelivery && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-body font-bold text-lg">Pedido {selectedDelivery.orderId}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusConfig[selectedDelivery.status].color} bg-card border border-border`}>
              {statusConfig[selectedDelivery.status].label}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><User size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{selectedDelivery.customer}</p></div></div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{selectedDelivery.phone || "N/A"}</p></div></div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{selectedDelivery.address}</p></div></div>
            <div className="flex items-center gap-2"><Package size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium text-primary">{selectedDelivery.total}</p></div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDelivery.status === "pending" && (
              <Button onClick={() => updateStatus(selectedDelivery.id, "in_transit")} className="gradient-pet text-primary-foreground text-xs gap-1"><Truck size={14} /> Iniciar Entrega</Button>
            )}
            {selectedDelivery.status === "in_transit" && (
              <Button onClick={() => updateStatus(selectedDelivery.id, "delivered")} className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1"><CheckCircle size={14} /> Finalizar Entrega</Button>
            )}
            <Button variant="outline" onClick={() => openRoute(selectedDelivery.address)} className="text-xs gap-1 border-primary text-primary hover:bg-primary/10">
              <Navigation size={14} /> Traçar Rota
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDelivery(null)} className="text-xs text-muted-foreground">Fechar</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Pedido</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Endereço</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Valor</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma entrega encontrada</td></tr>
              ) : filtered.map((d) => {
                const cfg = statusConfig[d.status];
                return (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedDelivery(d)}>
                    <td className="p-3 font-bold">{d.orderId}</td>
                    <td className="p-3 hidden md:table-cell">{d.customer}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{d.address}</td>
                    <td className="p-3 text-right font-bold">{d.total}</td>
                    <td className="p-3 text-right"><span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openRoute(d.address); }} className="text-xs gap-1">
                        <Navigation size={12} /> Rota
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
