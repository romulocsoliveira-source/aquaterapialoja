import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/admin/ImageUpload";
import { Building2, MapPin, FileText, CreditCard, Truck, Store, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PAYMENT_OPTIONS = ["Dinheiro", "PIX", "Cartão débito", "Cartão crédito", "Boleto", "Outros"];
const TAX_REGIMES = ["MEI", "Simples Nacional", "Lucro Presumido", "Lucro Real"];

type Section = "empresa" | "endereco" | "fiscal" | "pagamentos" | "entregas" | "mercadolivre";

const SECTIONS: { id: Section; label: string; icon: typeof Building2 }[] = [
  { id: "empresa", label: "Dados da Empresa", icon: Building2 },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "fiscal", label: "Configuração Fiscal", icon: FileText },
  { id: "pagamentos", label: "Formas de Pagamento", icon: CreditCard },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "mercadolivre", label: "Mercado Livre", icon: Store },
];

export default function CompanySettingsTab() {
  const { user } = useAuth();
  const { data: storeConfig, isLoading } = useStoreConfig();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<Section>("empresa");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: "", trade_name: "", cnpj: "", phone: "", whatsapp: "", email: "", logo_url: "",
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "",
    tax_regime: "", issues_invoice: false, invoice_type: "", certificate_url: "", certificate_password: "",
    payment_methods: [] as string[],
    has_delivery: false, delivery_fee: "", delivery_radius: "", delivery_neighborhoods: [] as string[],
    has_mercadolivre: false, ml_email: "", ml_login: "", ml_store_name: "",
  });

  const [neighborhoodInput, setNeighborhoodInput] = useState("");

  useEffect(() => {
    if (storeConfig) {
      setForm({
        company_name: storeConfig.company_name || "",
        trade_name: storeConfig.trade_name || "",
        cnpj: storeConfig.cnpj || "",
        phone: storeConfig.phone || "",
        whatsapp: storeConfig.whatsapp || "",
        email: storeConfig.email || "",
        logo_url: storeConfig.logo_url || "",
        street: storeConfig.street || "",
        number: storeConfig.number || "",
        complement: storeConfig.complement || "",
        neighborhood: storeConfig.neighborhood || "",
        city: storeConfig.city || "",
        state: storeConfig.state || "",
        zip_code: storeConfig.zip_code || "",
        tax_regime: storeConfig.tax_regime || "",
        issues_invoice: storeConfig.issues_invoice || false,
        invoice_type: storeConfig.invoice_type || "",
        certificate_url: storeConfig.certificate_url || "",
        certificate_password: storeConfig.certificate_password || "",
        payment_methods: storeConfig.payment_methods || [],
        has_delivery: storeConfig.has_delivery || false,
        delivery_fee: storeConfig.delivery_fee?.toString() || "",
        delivery_radius: storeConfig.delivery_radius?.toString() || "",
        delivery_neighborhoods: storeConfig.delivery_neighborhoods || [],
        has_mercadolivre: storeConfig.has_mercadolivre || false,
        ml_email: storeConfig.ml_email || "",
        ml_login: storeConfig.ml_login || "",
        ml_store_name: storeConfig.ml_store_name || "",
      });
    }
  }, [storeConfig]);

  const handleSave = async () => {
    if (!user || !storeConfig?.id) return;
    setSaving(true);

    const payload: any = {
      company_name: form.company_name || null,
      trade_name: form.trade_name || null,
      cnpj: form.cnpj || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      logo_url: form.logo_url || null,
      street: form.street || null,
      number: form.number || null,
      complement: form.complement || null,
      neighborhood: form.neighborhood || null,
      city: form.city || null,
      state: form.state || null,
      zip_code: form.zip_code || null,
      tax_regime: form.tax_regime || null,
      issues_invoice: form.issues_invoice,
      invoice_type: form.invoice_type || null,
      certificate_url: form.certificate_url || null,
      certificate_password: form.certificate_password || null,
      payment_methods: form.payment_methods,
      has_delivery: form.has_delivery,
      delivery_fee: form.delivery_fee ? Number(form.delivery_fee) : 0,
      delivery_radius: form.delivery_radius ? Number(form.delivery_radius) : 0,
      delivery_neighborhoods: form.delivery_neighborhoods,
      has_mercadolivre: form.has_mercadolivre,
      ml_email: form.ml_email || null,
      ml_login: form.ml_login || null,
      ml_store_name: form.ml_store_name || null,
    };

    const { error } = await supabase.from("store_config").update(payload).eq("id", storeConfig.id);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["store-config"] });
    }
    setSaving(false);
  };

  const togglePayment = (method: string) => {
    setForm(f => ({
      ...f,
      payment_methods: f.payment_methods.includes(method)
        ? f.payment_methods.filter(m => m !== method)
        : [...f.payment_methods, method],
    }));
  };

  const addNeighborhood = () => {
    if (!neighborhoodInput.trim()) return;
    setForm(f => ({ ...f, delivery_neighborhoods: [...f.delivery_neighborhoods, neighborhoodInput.trim()] }));
    setNeighborhoodInput("");
  };

  const removeNeighborhood = (idx: number) => {
    setForm(f => ({ ...f, delivery_neighborhoods: f.delivery_neighborhoods.filter((_, i) => i !== idx) }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!storeConfig) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Nenhuma configuração encontrada. Utilize o assistente de <strong>Implantação da Loja</strong> primeiro.</p>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Configurações da Empresa</h2>
          <p className="text-sm text-muted-foreground">Edite os dados utilizados em todo o sistema.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Alterações
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body whitespace-nowrap transition-colors ${
              activeSection === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
        {activeSection === "empresa" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nome da Empresa</Label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Razão Social" className="mt-1" /></div>
              <div><Label>Nome Fantasia</Label><Input value={form.trade_name} onChange={e => setForm(f => ({ ...f, trade_name: e.target.value }))} placeholder="Nome Fantasia" className="mt-1" /></div>
              <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="mt-1" /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 0000-0000" className="mt-1" /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(00) 00000-0000" className="mt-1" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@empresa.com" className="mt-1" /></div>
            </div>
            <div>
              <Label>Logo da Empresa</Label>
              <div className="mt-2">
                <ImageUpload value={form.logo_url} onChange={(url) => setForm(f => ({ ...f, logo_url: url }))} />
              </div>
            </div>
          </>
        )}

        {activeSection === "endereco" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Rua</Label><Input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="mt-1" /></div>
            <div><Label>Número</Label><Input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className="mt-1" /></div>
            <div><Label>Complemento</Label><Input value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} className="mt-1" /></div>
            <div><Label>Bairro</Label><Input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="mt-1" /></div>
            <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="mt-1" /></div>
            <div><Label>Estado</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} className="mt-1" /></div>
            <div><Label>CEP</Label><Input value={form.zip_code} onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))} className="mt-1" /></div>
          </div>
        )}

        {activeSection === "fiscal" && (
          <div className="space-y-4">
            <div>
              <Label>Regime Tributário</Label>
              <select value={form.tax_regime} onChange={e => setForm(f => ({ ...f, tax_regime: e.target.value }))} className={inputClass + " mt-1"}>
                <option value="">Selecione...</option>
                {TAX_REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.issues_invoice} onCheckedChange={v => setForm(f => ({ ...f, issues_invoice: v }))} />
              <Label>A empresa emite nota fiscal?</Label>
            </div>
            {form.issues_invoice && (
              <div>
                <Label>Tipo de Nota</Label>
                <select value={form.invoice_type} onChange={e => setForm(f => ({ ...f, invoice_type: e.target.value }))} className={inputClass + " mt-1"}>
                  <option value="">Selecione...</option>
                  <option value="nfe">NF-e (Produto)</option>
                  <option value="nfse">NFS-e (Serviço)</option>
                </select>
              </div>
            )}
          </div>
        )}

        {activeSection === "pagamentos" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Selecione as formas de pagamento aceitas:</p>
            {PAYMENT_OPTIONS.map(pm => (
              <div key={pm} className="flex items-center gap-3">
                <Checkbox checked={form.payment_methods.includes(pm)} onCheckedChange={() => togglePayment(pm)} />
                <span className="text-sm">{pm}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === "entregas" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={form.has_delivery} onCheckedChange={v => setForm(f => ({ ...f, has_delivery: v }))} />
              <Label>A empresa realiza entregas?</Label>
            </div>
            {form.has_delivery && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Taxa de Entrega (R$)</Label><Input type="number" value={form.delivery_fee} onChange={e => setForm(f => ({ ...f, delivery_fee: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Raio de Entrega (km)</Label><Input type="number" value={form.delivery_radius} onChange={e => setForm(f => ({ ...f, delivery_radius: e.target.value }))} className="mt-1" /></div>
                </div>
                <div>
                  <Label>Bairros Atendidos</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={neighborhoodInput} onChange={e => setNeighborhoodInput(e.target.value)} placeholder="Nome do bairro" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addNeighborhood())} />
                    <Button type="button" variant="outline" onClick={addNeighborhood}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.delivery_neighborhoods.map((n, i) => (
                      <span key={i} className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        {n} <button onClick={() => removeNeighborhood(i)} className="text-muted-foreground hover:text-destructive">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === "mercadolivre" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={form.has_mercadolivre} onCheckedChange={v => setForm(f => ({ ...f, has_mercadolivre: v }))} />
              <Label>Integração com Mercado Livre?</Label>
            </div>
            {form.has_mercadolivre && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Email da Conta</Label><Input value={form.ml_email} onChange={e => setForm(f => ({ ...f, ml_email: e.target.value }))} className="mt-1" /></div>
                <div><Label>Login</Label><Input value={form.ml_login} onChange={e => setForm(f => ({ ...f, ml_login: e.target.value }))} className="mt-1" /></div>
                <div className="md:col-span-2"><Label>Nome da Loja</Label><Input value={form.ml_store_name} onChange={e => setForm(f => ({ ...f, ml_store_name: e.target.value }))} className="mt-1" /></div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
