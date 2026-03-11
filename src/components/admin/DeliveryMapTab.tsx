import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, CheckCircle, Clock, AlertCircle, Navigation, Phone, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
}

const statusConfig: Record<DeliveryStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: "Pendente", color: "text-red-400", bgColor: "bg-red-500", icon: AlertCircle },
  in_transit: { label: "Em Entrega", color: "text-yellow-400", bgColor: "bg-yellow-500", icon: Truck },
  delivered: { label: "Entregue", color: "text-green-400", bgColor: "bg-green-500", icon: CheckCircle },
};

const mockDeliveries: Delivery[] = [
  { id: "1", orderId: "#1001", customer: "Maria Silva", phone: "(18) 99999-1234", address: "Rua Dom Antônio, 450", neighborhood: "Centro", total: "R$ 289,80", status: "pending", items: 3, createdAt: "10/03/2026 09:30" },
  { id: "2", orderId: "#1002", customer: "João Santos", phone: "(18) 99888-5678", address: "Av. Rui Barbosa, 1200", neighborhood: "Vila Operária", total: "R$ 159,90", status: "in_transit", items: 1, createdAt: "10/03/2026 10:15" },
  { id: "3", orderId: "#1003", customer: "Ana Oliveira", phone: "(18) 99777-9012", address: "Rua José Bonifácio, 380", neighborhood: "Jd. Paulista", total: "R$ 449,70", status: "delivered", items: 5, createdAt: "09/03/2026 14:00" },
  { id: "4", orderId: "#1004", customer: "Carlos Lima", phone: "(18) 99666-3456", address: "Rua Cel. Marcondes, 87", neighborhood: "Centro", total: "R$ 89,90", status: "pending", items: 2, createdAt: "10/03/2026 11:00" },
  { id: "5", orderId: "#1005", customer: "Fernanda Costa", phone: "(18) 99555-7890", address: "Rua Minas Gerais, 510", neighborhood: "Vila Nova", total: "R$ 329,90", status: "in_transit", items: 4, createdAt: "10/03/2026 08:45" },
  { id: "6", orderId: "#1006", customer: "Ricardo Alves", phone: "(18) 99444-2345", address: "Av. Getúlio Vargas, 920", neighborhood: "Jd. Europa", total: "R$ 199,90", status: "delivered", items: 2, createdAt: "09/03/2026 16:30" },
];

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
    window.open(`https://www.google.com/maps/dir/Av.+Armando+Sales+de+Oliveira,+173,+Assis+-+SP/${encoded}`, "_blank");
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

      {/* Map visualization */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-body font-semibold flex items-center gap-2"><MapPin size={18} className="text-accent" /> Mapa de Entregas — Assis, SP</h3>
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.google.com/maps/place/Assis,+SP", "_blank")} className="text-xs gap-1">
            <Navigation size={14} /> Abrir Mapa Completo
          </Button>
        </div>
        <div className="relative bg-secondary h-[300px] flex items-center justify-center overflow-hidden">
          {/* Simulated map with delivery pins */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary opacity-50" />
          <div className="relative w-full h-full">
            {/* City grid simulation */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 300">
              {/* Grid lines (streets) */}
              {[50, 100, 150, 200, 250].map(y => <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />)}
              {[100, 200, 300, 400, 500, 600, 700].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />)}
              {/* Store marker */}
              <g transform="translate(400,150)">
                <circle r="8" fill="hsl(var(--accent))" opacity="0.3" />
                <circle r="4" fill="hsl(var(--accent))" />
                <text y="-14" textAnchor="middle" fill="hsl(var(--accent))" fontSize="9" fontWeight="bold">LOJA</text>
              </g>
            </svg>
            {/* Delivery markers */}
            {deliveries.map((d, i) => {
              const positions = [
                { x: "20%", y: "30%" }, { x: "65%", y: "20%" }, { x: "35%", y: "70%" },
                { x: "80%", y: "60%" }, { x: "15%", y: "65%" }, { x: "70%", y: "80%" },
              ];
              const pos = positions[i % positions.length];
              const cfg = statusConfig[d.status];
              return (
                <motion.button
                  key={d.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedDelivery(d)}
                  className={`absolute group`}
                  style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}
                >
                  <div className={`w-6 h-6 rounded-full ${cfg.bgColor} flex items-center justify-center shadow-lg ring-2 ring-background`}>
                    <MapPin size={12} className="text-white" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-card border border-border rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
                    {d.orderId} — {d.customer}
                  </div>
                </motion.button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border rounded-lg p-2 flex gap-3 text-[10px]">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.bgColor}`} />
                <span className="text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: "all", label: "Todos" }, ...Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${statusFilter === f.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f.label} {f.id !== "all" && `(${counts[f.id as DeliveryStatus]})`}
          </button>
        ))}
      </div>

      {/* Delivery detail panel */}
      {selectedDelivery && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 border-2 border-accent/30 rounded-xl p-6 space-y-4">
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
            <div className="flex items-center gap-2"><Package size={14} className="text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium text-accent">{selectedDelivery.total}</p></div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDelivery.status === "pending" && (
              <Button onClick={() => updateStatus(selectedDelivery.id, "in_transit")} className="gradient-gold text-primary-foreground text-xs gap-1"><Truck size={14} /> Iniciar Entrega</Button>
            )}
            {selectedDelivery.status === "in_transit" && (
              <Button onClick={() => updateStatus(selectedDelivery.id, "delivered")} className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1"><CheckCircle size={14} /> Finalizar Entrega</Button>
            )}
            <Button variant="outline" onClick={() => openRoute(selectedDelivery.address)} className="text-xs gap-1 border-accent text-accent hover:bg-accent/10">
              <Navigation size={14} /> Traçar Rota
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDelivery(null)} className="text-xs text-muted-foreground">Fechar</Button>
          </div>
        </motion.div>
      )}

      {/* Deliveries table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Pedido</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Endereço</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden lg:table-cell">Telefone</th>
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
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">{d.phone}</td>
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
