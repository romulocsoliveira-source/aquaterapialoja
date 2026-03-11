import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, CheckCircle, Clock, AlertCircle, Navigation, Phone, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

const STORE_LAT = -22.6617;
const STORE_LNG = -50.4122;

const mockDeliveries: Delivery[] = [
  { id: "1", orderId: "#1001", customer: "Maria Silva", phone: "(18) 99999-1234", address: "Rua Dom Antônio, 450", neighborhood: "Centro", total: "R$ 289,80", status: "pending", items: 3, createdAt: "10/03/2026 09:30", lat: -22.6590, lng: -50.4100 },
  { id: "2", orderId: "#1002", customer: "João Santos", phone: "(18) 99888-5678", address: "Av. Rui Barbosa, 1200", neighborhood: "Vila Operária", total: "R$ 159,90", status: "in_transit", items: 1, createdAt: "10/03/2026 10:15", lat: -22.6650, lng: -50.4180 },
  { id: "3", orderId: "#1003", customer: "Ana Oliveira", phone: "(18) 99777-9012", address: "Rua José Bonifácio, 380", neighborhood: "Jd. Paulista", total: "R$ 449,70", status: "delivered", items: 5, createdAt: "09/03/2026 14:00", lat: -22.6580, lng: -50.4050 },
  { id: "4", orderId: "#1004", customer: "Carlos Lima", phone: "(18) 99666-3456", address: "Rua Cel. Marcondes, 87", neighborhood: "Centro", total: "R$ 89,90", status: "pending", items: 2, createdAt: "10/03/2026 11:00", lat: -22.6630, lng: -50.4150 },
  { id: "5", orderId: "#1005", customer: "Fernanda Costa", phone: "(18) 99555-7890", address: "Rua Minas Gerais, 510", neighborhood: "Vila Nova", total: "R$ 329,90", status: "in_transit", items: 4, createdAt: "10/03/2026 08:45", lat: -22.6670, lng: -50.4070 },
  { id: "6", orderId: "#1006", customer: "Ricardo Alves", phone: "(18) 99444-2345", address: "Av. Getúlio Vargas, 920", neighborhood: "Jd. Europa", total: "R$ 199,90", status: "delivered", items: 2, createdAt: "09/03/2026 16:30", lat: -22.6600, lng: -50.4200 },
];

const createIcon = (color: string) => L.divIcon({
  className: "custom-marker",
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const statusColors: Record<DeliveryStatus, string> = {
  pending: "#ef4444",
  in_transit: "#eab308",
  delivered: "#22c55e",
};

export default function DeliveryMapTab() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const filtered = statusFilter === "all" ? deliveries : deliveries.filter(d => d.status === statusFilter);
  const counts = {
    pending: deliveries.filter(d => d.status === "pending").length,
    in_transit: deliveries.filter(d => d.status === "in_transit").length,
    delivered: deliveries.filter(d => d.status === "delivered").length,
  };

  const updateStatus = (id: string, newStatus: DeliveryStatus) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    const labels: Record<DeliveryStatus, string> = { pending: "pendente", in_transit: "em entrega", delivered: "entregue" };
    toast.success(`Pedido marcado como ${labels[newStatus]}`);
  };

  const openRoute = (address: string) => {
    const encoded = encodeURIComponent(`${address}, Assis, SP`);
    window.open(`https://www.google.com/maps/dir/Av.+Getúlio+Vargas,+339,+Assis+-+SP/${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
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

      {/* Real Map */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-body font-semibold flex items-center gap-2"><MapPin size={18} className="text-primary" /> Mapa de Entregas — Assis, SP</h3>
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.google.com/maps/place/Assis,+SP", "_blank")} className="text-xs gap-1">
            <Navigation size={14} /> Abrir no Google Maps
          </Button>
        </div>
        <div style={{ height: 400 }}>
          <MapContainer center={[STORE_LAT, STORE_LNG]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Store marker */}
            <Marker position={[STORE_LAT, STORE_LNG]} icon={createIcon("hsl(199, 89%, 48%)")}>
              <Popup><strong>Aquaterapia Pet Shop</strong><br/>Av. Getúlio Vargas, 339</Popup>
            </Marker>
            {/* Delivery markers */}
            {filtered.map(d => (
              <Marker key={d.id} position={[d.lat, d.lng]} icon={createIcon(statusColors[d.status])}
                eventHandlers={{ click: () => setSelectedDelivery(d) }}>
                <Popup>
                  <strong>{d.orderId}</strong> — {d.customer}<br/>
                  {d.address}<br/>
                  <strong>{d.total}</strong>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {/* Legend */}
        <div className="p-3 border-t border-border flex gap-4 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ background: "hsl(199, 89%, 48%)" }} /><span className="text-muted-foreground">Loja</span></div>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: statusColors[key as DeliveryStatus] }} />
              <span className="text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: "all", label: "Todos" }, ...Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${statusFilter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f.label} {f.id !== "all" && `(${counts[f.id as DeliveryStatus]})`}
          </button>
        ))}
      </div>

      {/* Detail panel */}
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
            <div className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{selectedDelivery.phone}</p></div></div>
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

      {/* Table */}
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
              {filtered.map(d => {
                const cfg = statusConfig[d.status];
                return (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedDelivery(d)}>
                    <td className="p-3 font-bold">{d.orderId}</td>
                    <td className="p-3 hidden md:table-cell">{d.customer}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{d.address}</td>
                    <td className="p-3 text-right font-bold">{d.total}</td>
                    <td className="p-3 text-right"><span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openRoute(d.address); }} className="text-xs gap-1">
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
