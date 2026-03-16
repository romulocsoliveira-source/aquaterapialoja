import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts, useCategories } from "@/hooks/useStoreData";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useAdminRole";
import AuthForm from "@/components/account/AuthForm";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import OrdersCentralTab from "@/components/admin/OrdersCentralTab";
import FinancialTab from "@/components/admin/FinancialTab";
import FiscalTab from "@/components/admin/FiscalTab";
import SuppliersTab from "@/components/admin/SuppliersTab";
import PurchasesTab from "@/components/admin/PurchasesTab";
import ReportsTab from "@/components/admin/ReportsTab";
import MercadoLivreTab from "@/components/admin/MercadoLivreTab";
import DeliveryMapTab from "@/components/admin/DeliveryMapTab";
import SmartInventoryTab from "@/components/admin/SmartInventoryTab";
import AdminAgendaTab from "@/components/admin/AdminAgendaTab";
import AdminHotelTab from "@/components/admin/AdminHotelTab";
import AdminServicosTab from "@/components/admin/AdminServicosTab";
import AdminPetsTab from "@/components/admin/AdminPetsTab";
import StoreSetupWizard from "@/components/admin/StoreSetupWizard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3, Package, ShoppingCart, Users, Tag, AlertTriangle,
  TrendingUp, DollarSign, ArrowLeft, Search, Edit, Trash2, Plus,
  Eye, Bell, Store, MessageCircle, Monitor, Smartphone, FileText, Truck, ShoppingBag, MapPin, Brain,
  Scissors, Building2, PawPrint, Calendar, Camera, Rocket, CreditCard
} from "lucide-react";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import StockEntryDialog from "@/components/admin/StockEntryDialog";
import ProductLabelPrint from "@/components/shared/ProductLabelPrint";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type AdminTab = "dashboard" | "products" | "orders" | "financial" | "fiscal" | "suppliers" | "purchases" | "coupons" | "stock" | "inventory" | "deliveries" | "reports" | "notifications" | "integrations" | "mercadolivre" | "agenda" | "hotel" | "servicos" | "pets" | "setup";

const CHANNELS = ["Loja Online", "WhatsApp", "Mercado Livre", "PDV"] as const;
type Channel = typeof CHANNELS[number];

const channelIcons: Record<Channel, React.ReactNode> = {
  "Loja Online": <Monitor size={14} />,
  "WhatsApp": <MessageCircle size={14} />,
  "Mercado Livre": <Store size={14} />,
  "PDV": <Smartphone size={14} />,
};

const channelColors: Record<Channel, string> = {
  "Loja Online": "bg-accent/20 text-accent",
  "WhatsApp": "bg-[#25D366]/20 text-[#25D366]",
  "Mercado Livre": "bg-yellow-500/20 text-yellow-400",
  "PDV": "bg-blue-500/20 text-blue-400",
};

export default function AdminPage() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  if (!user) {
    return (
      <div className="container max-w-md py-20">
        <h1 className="font-display text-2xl font-bold text-center mb-8">Acesso Administrativo</h1>
        <AuthForm />
      </div>
    );
  }

  // Admins bypass payment gate
  const tabs = [
     { id: "dashboard" as AdminTab, label: "Dashboard", icon: BarChart3 },
     { id: "agenda" as AdminTab, label: "Agenda B&T", icon: Calendar },
     { id: "servicos" as AdminTab, label: "Serviços", icon: Scissors },
     { id: "hotel" as AdminTab, label: "Hotel Pet", icon: Building2 },
     { id: "pets" as AdminTab, label: "Pets", icon: PawPrint },
     { id: "products" as AdminTab, label: "Produtos", icon: Package },
     { id: "orders" as AdminTab, label: "Central de Pedidos", icon: ShoppingCart },
     { id: "financial" as AdminTab, label: "Financeiro", icon: DollarSign },
     { id: "fiscal" as AdminTab, label: "Nota Fiscal", icon: FileText },
     { id: "suppliers" as AdminTab, label: "Fornecedores", icon: Truck },
     { id: "purchases" as AdminTab, label: "Compras", icon: ShoppingBag },
     { id: "coupons" as AdminTab, label: "Cupons", icon: Tag },
     { id: "stock" as AdminTab, label: "Estoque", icon: AlertTriangle },
     { id: "inventory" as AdminTab, label: "Estoque Inteligente", icon: Brain },
     { id: "deliveries" as AdminTab, label: "Mapa de Entregas", icon: MapPin },
     { id: "reports" as AdminTab, label: "Relatórios", icon: FileText },
     { id: "notifications" as AdminTab, label: "Notificações", icon: Bell },
     { id: "integrations" as AdminTab, label: "Integrações", icon: Store },
     { id: "mercadolivre" as AdminTab, label: "Mercado Livre", icon: Store },
     { id: "setup" as AdminTab, label: "Implantação da Loja", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="font-display text-lg font-bold text-gradient-gold">ADMIN · AQUATERAPIA PET SHOP</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pdv" className="text-xs font-body bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90">Abrir PDV</Link>
            <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground">Ver Loja</Link>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "agenda" && <AdminAgendaTab />}
        {activeTab === "servicos" && <AdminServicosTab />}
        {activeTab === "hotel" && <AdminHotelTab />}
        {activeTab === "pets" && <AdminPetsTab />}
        {activeTab === "products" && <ProductsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeTab === "orders" && <OrdersCentralTab />}
         {activeTab === "financial" && <FinancialTab />}
         {activeTab === "fiscal" && <FiscalTab />}
         {activeTab === "suppliers" && <SuppliersTab />}
        {activeTab === "purchases" && <PurchasesTab />}
        {activeTab === "coupons" && <CouponsTab />}
        {activeTab === "stock" && <StockTab />}
        {activeTab === "inventory" && <SmartInventoryTab />}
        {activeTab === "deliveries" && <DeliveryMapTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "mercadolivre" && <MercadoLivreTab />}
        {activeTab === "setup" && <StoreSetupWizard />}
        
      </div>
    </div>
  );
}

/* ==================== DASHBOARD ==================== */
function DashboardTab() {
  const { data: products = [] } = useProducts();
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) < 10).length;

  const channelRevenue = [
    { channel: "Loja Online", today: "R$ 1.280,00", month: "R$ 28.450,00", orders: 8 },
    { channel: "WhatsApp", today: "R$ 650,00", month: "R$ 12.300,00", orders: 3 },
    { channel: "Mercado Livre", today: "R$ 380,00", month: "R$ 5.670,00", orders: 2 },
    { channel: "PDV", today: "R$ 140,00", month: "R$ 2.500,00", orders: 1 },
  ];

  const stats = [
    { label: "Faturamento Hoje", value: "R$ 2.450,00", icon: DollarSign, color: "text-green-400" },
    { label: "Faturamento Mês", value: "R$ 48.920,00", icon: TrendingUp, color: "text-accent" },
    { label: "Pedidos Novos", value: "14", icon: ShoppingCart, color: "text-blue-400" },
    { label: "Produtos", value: String(totalProducts), icon: Package, color: "text-purple-400" },
    { label: "Estoque Total", value: String(totalStock), icon: Package, color: "text-yellow-400" },
    { label: "Estoque Baixo", value: String(lowStock), icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4">
            <stat.icon size={20} className={stat.color} />
            <p className="text-xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue by Channel */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-body font-semibold mb-4">Faturamento por Canal</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {channelRevenue.map(ch => (
            <div key={ch.channel} className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {channelIcons[ch.channel as Channel]}
                <span className="text-xs font-semibold">{ch.channel}</span>
              </div>
              <p className="text-lg font-bold">{ch.today}</p>
              <p className="text-xs text-muted-foreground">Mês: {ch.month}</p>
              <p className="text-xs text-muted-foreground">{ch.orders} pedidos hoje</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-body font-semibold mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {[...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-accent w-6">{i + 1}º</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.reviews} vendas</p>
                </div>
                <span className="text-sm font-bold text-accent">R$ {(p.promoPrice || p.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-body font-semibold mb-4">Alertas de Estoque</h3>
          <div className="space-y-3">
            {products.filter(p => (p.stock || 0) < 15).sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <AlertTriangle size={14} className={(p.stock || 0) < 5 ? "text-red-400" : "text-yellow-400"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                </div>
                <span className={`text-sm font-bold ${(p.stock || 0) < 5 ? "text-red-400" : "text-yellow-400"}`}>{p.stock} un</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== PRODUCTS ==================== */
function ProductsTab({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (s: string) => void }) {
  const { data: products = [] } = useProducts();
  const { data: isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(typeof products)[number] | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: (typeof products)[number]) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleDelete = async (product: (typeof products)[number]) => {
    if (!confirm(`Excluir "${product.name}"?`)) return;
    const { error } = await supabase.from("store_products").delete().eq("id", product.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Produto excluído");
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
    }
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["store-products"] });
    queryClient.invalidateQueries({ queryKey: ["store-categories"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nome, SKU ou categoria..." className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground" />
        </div>
        <Button onClick={handleNew} className="gradient-purple-pink text-primary-foreground font-body text-sm gap-2"><Plus size={16} /> Novo Produto</Button>
      </div>

      {!isAdmin && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          ⚠️ Você não tem permissão de admin. Operações de criar/editar/excluir estarão indisponíveis.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">SKU</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Preço</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden lg:table-cell">Margem</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Estoque</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" /><span className="font-medium truncate max-w-[200px]">{p.name}</span></div></td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{p.sku}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                  <td className="p-3 text-right">{p.promoPrice ? (<div><span className="line-through text-muted-foreground text-xs">R$ {p.price.toFixed(2)}</span><br /><span className="text-accent font-bold">R$ {p.promoPrice.toFixed(2)}</span></div>) : (<span className="font-bold">R$ {p.price.toFixed(2)}</span>)}</td>
                  <td className="p-3 text-right hidden lg:table-cell">{(p.costPrice || 0) > 0 ? (<div><span className="text-xs text-muted-foreground">Custo: R$ {(p.costPrice || 0).toFixed(2)}</span><br /><span className="font-bold text-green-400">{((1 - (p.costPrice || 0) / (p.promoPrice || p.price)) * 100).toFixed(0)}%</span></div>) : (<span className="text-xs text-muted-foreground">—</span>)}</td>
                  <td className="p-3 text-right"><span className={`font-bold ${(p.stock || 0) < 10 ? "text-destructive" : "text-accent"}`}>{p.stock}</span></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/produto/${p.slug}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye size={14} /></Link>
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">Exibindo {Math.min(filtered.length, 20)} de {filtered.length} produtos</div>
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} onSaved={handleSaved} />
    </div>
  );
}

/* ==================== CENTRAL DE PEDIDOS (multi-channel) ==================== */

/* ==================== COUPONS ==================== */
function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: "", min_order_value: "", max_uses: "" });

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: form.min_order_value ? Number(form.min_order_value) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Cupom criado!");
    setShowForm(false);
    setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_value: "", max_uses: "" });
    fetchCoupons();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Excluir cupom?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Cupom excluído");
    fetchCoupons();
  };

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="gradient-purple-pink text-primary-foreground font-body text-sm gap-2"><Plus size={16} /> Novo Cupom</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-body font-medium">Código *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="BEMVINDO10" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body font-medium">Tipo</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body font-medium">Valor *</label>
              <input required type="number" step="0.01" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="10" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body font-medium">Pedido Mínimo</label>
              <input type="number" step="0.01" value={form.min_order_value} onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="50" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="gradient-purple-pink text-primary-foreground text-sm">Criar Cupom</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-body font-semibold text-muted-foreground">Código</th>
              <th className="text-left p-3 font-body font-semibold text-muted-foreground">Desconto</th>
              <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Pedido Mínimo</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Usos</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum cupom cadastrado</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="p-3 font-mono font-bold text-accent">{c.code}</td>
                <td className="p-3">{c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(Number(c.discount_value))}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{c.min_order_value ? formatPrice(Number(c.min_order_value)) : "—"}</td>
                <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="p-3 text-right">
                  <button onClick={() => toggleActive(c.id, c.is_active)}>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {c.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => deleteCoupon(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==================== STOCK ==================== */
function StockTab() {
  const { data: products = [] } = useProducts();
  const [showScanner, setShowScanner] = useState(false);
  const [stockProduct, setStockProduct] = useState<(typeof products)[number] | null>(null);
  const [showStockEntry, setShowStockEntry] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 20).sort((a, b) => (a.stock || 0) - (b.stock || 0));

  const handleScanResult = (code: string) => {
    const found = products.find(p => p.barcode === code);
    if (found) {
      setStockProduct(found as any);
      setShowStockEntry(true);
    } else {
      toast.error("Produto não encontrado para o código: " + code);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Controle de Estoque</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowLabels(true)} className="gap-1 text-xs">
            <Tag size={14} /> Etiquetas
          </Button>
          <Button onClick={() => setShowScanner(true)} className="gap-1 text-sm">
            <Camera size={16} /> Entrada por Código de Barras
          </Button>
        </div>
      </div>

      <BarcodeScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScanResult}
        title="Entrada de Estoque — Escanear Produto"
      />
      <StockEntryDialog
        open={showStockEntry}
        onOpenChange={setShowStockEntry}
        product={stockProduct}
      />
      <ProductLabelPrint
        open={showLabels}
        onOpenChange={setShowLabels}
        products={products.slice(0, 30).map(p => ({ name: p.name, price: p.price, promoPrice: p.promoPrice, barcode: p.barcode }))}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{products.filter(p => (p.stock || 0) >= 20).length}</p>
          <p className="text-xs text-muted-foreground">Estoque Normal</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{products.filter(p => (p.stock || 0) >= 10 && (p.stock || 0) < 20).length}</p>
          <p className="text-xs text-muted-foreground">Estoque Baixo</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{products.filter(p => (p.stock || 0) < 10).length}</p>
          <p className="text-xs text-muted-foreground">Crítico</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-body font-semibold text-muted-foreground">Produto</th>
              <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">SKU</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground">Estoque</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
              <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map(p => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><span className="truncate max-w-[200px]">{p.name}</span></div></td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{p.sku}</td>
                <td className="p-3 text-right font-bold">{p.stock}</td>
                <td className="p-3 text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${(p.stock || 0) < 10 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {(p.stock || 0) < 10 ? "Crítico" : "Baixo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => { setStockProduct(p as any); setShowStockEntry(true); }}>
                    <Plus size={12} /> Entrada
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ReportsTab moved to src/components/admin/ReportsTab.tsx */

/* ==================== NOTIFICATIONS ==================== */
function NotificationsTab() {
  const notifications = [
    { type: "order", title: "Novo pedido #1008", desc: "Venda Balcão — PDV — R$ 75,00", time: "2 min atrás", color: "text-blue-400" },
    { type: "payment", title: "Pagamento aprovado #1006", desc: "Ricardo Alves — WhatsApp — R$ 199,90", time: "15 min atrás", color: "text-green-400" },
    { type: "stock", title: "Estoque baixo", desc: "Body Rendado Preto — apenas 3 unidades", time: "1h atrás", color: "text-red-400" },
    { type: "order", title: "Novo pedido #1007", desc: "Paula Mendes — Mercado Livre — R$ 549,00", time: "2h atrás", color: "text-blue-400" },
    { type: "shipping", title: "Pedido enviado #1003", desc: "Ana Oliveira — Código: BR123456789", time: "3h atrás", color: "text-purple-400" },
    { type: "payment", title: "Pagamento aprovado #1005", desc: "Fernanda Costa — Loja Online — R$ 329,90", time: "5h atrás", color: "text-green-400" },
    { type: "stock", title: "Estoque crítico", desc: "Gel Estimulante Hot — apenas 2 unidades", time: "6h atrás", color: "text-red-400" },
  ];

  return (
    <div className="space-y-3">
      {notifications.map((n, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-accent/30 transition-colors">
          <Bell size={18} className={n.color} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{n.title}</h4>
            <p className="text-xs text-muted-foreground">{n.desc}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ==================== INTEGRATIONS ==================== */
function IntegrationsTab() {
  const integrations = [
    {
      name: "Mercado Livre",
      icon: Store,
      status: "Pendente",
      statusColor: "bg-yellow-500/20 text-yellow-400",
      desc: "Sincronize produtos, estoque e pedidos com o Mercado Livre.",
      features: ["Importar/exportar produtos", "Sincronizar estoque", "Importar pedidos", "Sincronizar preços"],
    },
    {
      name: "WhatsApp Business",
      icon: MessageCircle,
      status: "Ativo",
      statusColor: "bg-green-500/20 text-green-400",
      desc: "Atendimento e vendas via WhatsApp com mensagens automáticas.",
      features: ["Botão comprar pelo WhatsApp", "Envio de carrinho", "Mensagens automáticas", "Atendimento direto"],
    },
    {
      name: "Mercado Pago",
      icon: DollarSign,
      status: "Pendente",
      statusColor: "bg-yellow-500/20 text-yellow-400",
      desc: "Gateway de pagamento com Pix, cartão de crédito e boleto.",
      features: ["Pix instantâneo", "Cartão de crédito/débito", "Boleto bancário", "Webhook de status"],
    },
  ];

  return (
    <div className="space-y-4">
      {integrations.map(int => (
        <div key={int.name} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <int.icon size={24} className="text-accent" />
              <div>
                <h3 className="font-body font-semibold">{int.name}</h3>
                <p className="text-xs text-muted-foreground">{int.desc}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${int.statusColor}`}>{int.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {int.features.map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {f}
              </div>
            ))}
          </div>
          {int.status === "Pendente" && (
            <Button variant="outline" className="mt-4 text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              Configurar Integração
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
