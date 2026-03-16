import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  Building2, MapPin, FileText, Package, Boxes, CreditCard, Truck,
  Store, Users, CheckCircle2, ChevronRight, ChevronLeft, Save, Rocket,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { num: 1, label: "Dados da Empresa", icon: Building2 },
  { num: 2, label: "Endereço", icon: MapPin },
  { num: 3, label: "Config. Fiscal", icon: FileText },
  { num: 4, label: "Produtos", icon: Package },
  { num: 5, label: "Estoque", icon: Boxes },
  { num: 6, label: "Pagamentos", icon: CreditCard },
  { num: 7, label: "Entregas", icon: Truck },
  { num: 8, label: "Mercado Livre", icon: Store },
  { num: 9, label: "Usuários", icon: Users },
  { num: 10, label: "Conclusão", icon: CheckCircle2 },
];

const PAYMENT_OPTIONS = ["Dinheiro", "PIX", "Cartão débito", "Cartão crédito", "Boleto", "Outros"];
const TAX_REGIMES = ["MEI", "Simples Nacional", "Lucro Presumido", "Lucro Real"];

type ConfigData = {
  id?: string;
  company_name: string;
  trade_name: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  logo_url: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  tax_regime: string;
  issues_invoice: boolean;
  invoice_type: string;
  certificate_url: string;
  certificate_password: string;
  product_import_method: string;
  auto_stock_control: boolean;
  min_stock_default: number;
  payment_methods: string[];
  has_delivery: boolean;
  delivery_fee: number;
  delivery_radius: number;
  delivery_neighborhoods: string[];
  has_mercadolivre: boolean;
  ml_email: string;
  ml_login: string;
  ml_store_name: string;
  completed_steps: number[];
  current_step: number;
  setup_completed: boolean;
};

const defaultConfig: ConfigData = {
  company_name: "", trade_name: "", cnpj: "", phone: "", whatsapp: "", email: "", logo_url: "",
  street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "",
  tax_regime: "MEI", issues_invoice: false, invoice_type: "nfe", certificate_url: "", certificate_password: "",
  product_import_method: "manual",
  auto_stock_control: true, min_stock_default: 5,
  payment_methods: [],
  has_delivery: false, delivery_fee: 0, delivery_radius: 0, delivery_neighborhoods: [],
  has_mercadolivre: false, ml_email: "", ml_login: "", ml_store_name: "",
  completed_steps: [], current_step: 1, setup_completed: false,
};

export default function StoreSetupWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [newUsers, setNewUsers] = useState<{ name: string; role: string; email: string; password: string }[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from("store_config").select("*").limit(1).maybeSingle();
    if (data) {
      setConfig({
        id: data.id,
        company_name: data.company_name || "",
        trade_name: data.trade_name || "",
        cnpj: data.cnpj || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        logo_url: data.logo_url || "",
        street: data.street || "",
        number: data.number || "",
        complement: data.complement || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        tax_regime: data.tax_regime || "MEI",
        issues_invoice: data.issues_invoice || false,
        invoice_type: data.invoice_type || "nfe",
        certificate_url: data.certificate_url || "",
        certificate_password: data.certificate_password || "",
        product_import_method: data.product_import_method || "manual",
        auto_stock_control: data.auto_stock_control ?? true,
        min_stock_default: data.min_stock_default || 5,
        payment_methods: data.payment_methods || [],
        has_delivery: data.has_delivery || false,
        delivery_fee: Number(data.delivery_fee) || 0,
        delivery_radius: Number(data.delivery_radius) || 0,
        delivery_neighborhoods: data.delivery_neighborhoods || [],
        has_mercadolivre: data.has_mercadolivre || false,
        ml_email: data.ml_email || "",
        ml_login: data.ml_login || "",
        ml_store_name: data.ml_store_name || "",
        completed_steps: data.completed_steps || [],
        current_step: data.current_step || 1,
        setup_completed: data.setup_completed || false,
      });
      setStep(data.current_step || 1);
    }
    setLoading(false);
  };

  const saveProgress = async (markComplete = false) => {
    setSaving(true);
    const completedSteps = markComplete
      ? [...new Set([...config.completed_steps, step])]
      : config.completed_steps;

    const payload: any = {
      ...config,
      completed_steps: completedSteps,
      current_step: step,
      setup_completed: completedSteps.length >= 9,
    };
    delete payload.id;
    payload.created_by = user?.id;

    let error;
    if (config.id) {
      ({ error } = await supabase.from("store_config").update(payload).eq("id", config.id));
    } else {
      const res = await supabase.from("store_config").insert(payload).select("id").single();
      error = res.error;
      if (res.data) setConfig(prev => ({ ...prev, id: res.data.id }));
    }

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      setConfig(prev => ({ ...prev, completed_steps: completedSteps }));
      queryClient.invalidateQueries({ queryKey: ["store-config"] });
      if (markComplete) toast.success("Etapa salva!");
    }
    setSaving(false);
  };

  const goNext = async () => {
    await saveProgress(true);
    if (step < 10) setStep(s => s + 1);
  };

  const goPrev = () => { if (step > 1) setStep(s => s - 1); };

  const set = (key: keyof ConfigData, val: any) => setConfig(prev => ({ ...prev, [key]: val }));
  const togglePayment = (m: string) => {
    setConfig(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(m)
        ? prev.payment_methods.filter(x => x !== m)
        : [...prev.payment_methods, m]
    }));
  };

  const addNeighborhood = () => {
    if (!neighborhoodInput.trim()) return;
    set("delivery_neighborhoods", [...config.delivery_neighborhoods, neighborhoodInput.trim()]);
    setNeighborhoodInput("");
  };

  const progressPercent = Math.round((config.completed_steps.length / 9) * 100);
  const pendingSteps = STEPS.filter(s => s.num <= 9 && !config.completed_steps.includes(s.num));

  if (loading) return <div className="text-center py-20 text-muted-foreground">Carregando configuração...</div>;

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Rocket className="text-accent" size={22} /> Implantação da Loja</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure seu sistema em poucos minutos</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-accent">{progressPercent}%</span>
            <p className="text-xs text-muted-foreground">concluído</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-3" />

        {/* Step indicators */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
          {STEPS.map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                step === s.num
                  ? "bg-accent text-accent-foreground font-semibold"
                  : config.completed_steps.includes(s.num)
                  ? "bg-green-500/20 text-green-400"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {config.completed_steps.includes(s.num) ? <CheckCircle2 size={12} /> : <s.icon size={12} />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending alerts */}
      {pendingSteps.length > 0 && config.completed_steps.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-yellow-400 mb-2"><AlertTriangle size={14} /> Pendências</h4>
          <div className="flex flex-wrap gap-2">
            {pendingSteps.map(s => (
              <button key={s.num} onClick={() => setStep(s.num)} className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground hover:text-foreground">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            {(() => { const S = STEPS[step - 1]; return <><S.icon size={20} className="text-accent" /> Etapa {step} — {S.label}</>; })()}
          </h3>

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={config.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Razão Social" /></div>
              <div className="space-y-2"><Label>Nome Fantasia</Label><Input value={config.trade_name} onChange={e => set("trade_name", e.target.value)} placeholder="Nome Fantasia" /></div>
              <div className="space-y-2"><Label>CNPJ</Label><Input value={config.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={config.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 0000-0000" /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input value={config.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={config.email} onChange={e => set("email", e.target.value)} placeholder="empresa@email.com" /></div>
              <div className="md:col-span-2">
                <ImageUpload value={config.logo_url} onChange={v => set("logo_url", v)} label="Logo da Empresa" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Rua</Label><Input value={config.street} onChange={e => set("street", e.target.value)} placeholder="Rua, Avenida..." /></div>
              <div className="space-y-2"><Label>Número</Label><Input value={config.number} onChange={e => set("number", e.target.value)} placeholder="123" /></div>
              <div className="space-y-2"><Label>Complemento</Label><Input value={config.complement} onChange={e => set("complement", e.target.value)} placeholder="Sala, Bloco..." /></div>
              <div className="space-y-2"><Label>Bairro</Label><Input value={config.neighborhood} onChange={e => set("neighborhood", e.target.value)} placeholder="Bairro" /></div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={config.city} onChange={e => set("city", e.target.value)} placeholder="Cidade" /></div>
              <div className="space-y-2"><Label>Estado</Label><Input value={config.state} onChange={e => set("state", e.target.value)} placeholder="SP" /></div>
              <div className="space-y-2"><Label>CEP</Label><Input value={config.zip_code} onChange={e => set("zip_code", e.target.value)} placeholder="00000-000" /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Regime Tributário</Label>
                <RadioGroup value={config.tax_regime} onValueChange={v => set("tax_regime", v)}>
                  {TAX_REGIMES.map(r => (
                    <div key={r} className="flex items-center gap-2">
                      <RadioGroupItem value={r} id={`tax-${r}`} />
                      <Label htmlFor={`tax-${r}`} className="font-normal cursor-pointer">{r}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={config.issues_invoice} onCheckedChange={v => set("issues_invoice", v)} />
                <Label>A empresa emite nota fiscal?</Label>
              </div>
              {config.issues_invoice && (
                <div className="space-y-4 pl-4 border-l-2 border-accent/30">
                  <div className="space-y-2">
                    <Label>Tipo de Nota</Label>
                    <RadioGroup value={config.invoice_type} onValueChange={v => set("invoice_type", v)}>
                      <div className="flex items-center gap-2"><RadioGroupItem value="nfe" id="nfe" /><Label htmlFor="nfe" className="font-normal cursor-pointer">NF-e (Produto)</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="nfse" id="nfse" /><Label htmlFor="nfse" className="font-normal cursor-pointer">NFS-e (Serviço)</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2"><Label>Senha do Certificado Digital</Label><Input type="password" value={config.certificate_password} onChange={e => set("certificate_password", e.target.value)} placeholder="Senha do certificado A1" /></div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Como deseja cadastrar os produtos?</Label>
              <RadioGroup value={config.product_import_method} onValueChange={v => set("product_import_method", v)}>
                <div className="flex items-center gap-2"><RadioGroupItem value="spreadsheet" id="pm-spread" /><Label htmlFor="pm-spread" className="font-normal cursor-pointer">Importar planilha</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="manual" id="pm-manual" /><Label htmlFor="pm-manual" className="font-normal cursor-pointer">Cadastrar manualmente</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="barcode" id="pm-barcode" /><Label htmlFor="pm-barcode" className="font-normal cursor-pointer">Usar código de barras</Label></div>
              </RadioGroup>
              {config.product_import_method === "spreadsheet" && (
                <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
                  <p>📋 Após finalizar a configuração, acesse a aba <strong>Produtos</strong> para importar sua planilha.</p>
                </div>
              )}
              {config.product_import_method === "barcode" && (
                <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
                  <p>📷 Após finalizar, use o leitor de código de barras no cadastro de produto para preencher dados automaticamente.</p>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={config.auto_stock_control} onCheckedChange={v => set("auto_stock_control", v)} />
                <Label>Ativar controle automático de estoque?</Label>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Estoque mínimo padrão</Label>
                <Input type="number" min={0} value={config.min_stock_default} onChange={e => set("min_stock_default", parseInt(e.target.value) || 0)} />
                <p className="text-xs text-muted-foreground">Alerta será exibido quando o estoque atingir esse valor</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <Label>Formas de pagamento aceitas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PAYMENT_OPTIONS.map(m => (
                  <label key={m} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    config.payment_methods.includes(m) ? "border-accent bg-accent/10" : "border-border bg-secondary"
                  }`}>
                    <Checkbox checked={config.payment_methods.includes(m)} onCheckedChange={() => togglePayment(m)} />
                    <span className="text-sm">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={config.has_delivery} onCheckedChange={v => set("has_delivery", v)} />
                <Label>A empresa realiza entregas?</Label>
              </div>
              {config.has_delivery && (
                <div className="space-y-4 pl-4 border-l-2 border-accent/30">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Taxa de entrega padrão (R$)</Label><Input type="number" min={0} step={0.01} value={config.delivery_fee} onChange={e => set("delivery_fee", parseFloat(e.target.value) || 0)} /></div>
                    <div className="space-y-2"><Label>Raio de entrega (km)</Label><Input type="number" min={0} value={config.delivery_radius} onChange={e => set("delivery_radius", parseFloat(e.target.value) || 0)} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bairros atendidos</Label>
                    <div className="flex gap-2">
                      <Input value={neighborhoodInput} onChange={e => setNeighborhoodInput(e.target.value)} placeholder="Digite o bairro" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addNeighborhood())} />
                      <Button type="button" variant="outline" onClick={addNeighborhood}>Adicionar</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.delivery_neighborhoods.map((n, i) => (
                        <span key={i} className="bg-secondary text-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {n}
                          <button onClick={() => set("delivery_neighborhoods", config.delivery_neighborhoods.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={config.has_mercadolivre} onCheckedChange={v => set("has_mercadolivre", v)} />
                <Label>A empresa já possui conta no Mercado Livre?</Label>
              </div>
              {config.has_mercadolivre ? (
                <div className="space-y-4 pl-4 border-l-2 border-accent/30">
                  <div className="space-y-2"><Label>Email da conta</Label><Input value={config.ml_email} onChange={e => set("ml_email", e.target.value)} placeholder="email@mercadolivre.com" /></div>
                  <div className="space-y-2"><Label>Login</Label><Input value={config.ml_login} onChange={e => set("ml_login", e.target.value)} /></div>
                </div>
              ) : (
                <div className="space-y-2 pl-4 border-l-2 border-accent/30">
                  <Label>Nome desejado da loja no Mercado Livre</Label>
                  <Input value={config.ml_store_name} onChange={e => set("ml_store_name", e.target.value)} placeholder="Nome da loja" />
                </div>
              )}
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Cadastre os usuários iniciais do sistema.</p>
              {newUsers.map((u, i) => (
                <div key={i} className="bg-secondary rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Usuário {i + 1}</span>
                    <button onClick={() => setNewUsers(prev => prev.filter((_, j) => j !== i))} className="text-xs text-destructive">Remover</button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={u.name} onChange={e => { const n = [...newUsers]; n[i].name = e.target.value; setNewUsers(n); }} placeholder="Nome" />
                    <select value={u.role} onChange={e => { const n = [...newUsers]; n[i].role = e.target.value; setNewUsers(n); }} className="bg-background border border-input rounded-md px-3 py-2 text-sm">
                      <option value="admin">Administrador</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="estoque">Estoque</option>
                    </select>
                    <Input type="email" value={u.email} onChange={e => { const n = [...newUsers]; n[i].email = e.target.value; setNewUsers(n); }} placeholder="Email" />
                    <Input type="password" value={u.password} onChange={e => { const n = [...newUsers]; n[i].password = e.target.value; setNewUsers(n); }} placeholder="Senha" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setNewUsers(prev => [...prev, { name: "", role: "vendedor", email: "", password: "" }])}>
                + Adicionar Usuário
              </Button>
            </div>
          )}

          {step === 10 && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">Configuração {progressPercent >= 100 ? "Concluída" : "em Andamento"}!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {progressPercent >= 100
                  ? "Parabéns! Sua loja está configurada e pronta para funcionar."
                  : `Você completou ${progressPercent}% da configuração. Complete as etapas pendentes para ter o sistema totalmente funcional.`}
              </p>

              {/* Summary */}
              <div className="bg-secondary rounded-xl p-6 text-left max-w-lg mx-auto space-y-3">
                <h4 className="font-semibold mb-3">Resumo da Configuração</h4>
                {config.company_name && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Empresa</span><span>{config.trade_name || config.company_name}</span></div>}
                {config.city && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cidade</span><span>{config.city}/{config.state}</span></div>}
                {config.tax_regime && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Regime</span><span>{config.tax_regime}</span></div>}
                {config.payment_methods.length > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pagamentos</span><span>{config.payment_methods.length} formas</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entregas</span><span>{config.has_delivery ? "Ativado" : "Desativado"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mercado Livre</span><span>{config.has_mercadolivre ? "Conectado" : "Não configurado"}</span></div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Revisar Configurações</Button>
                <Button className="bg-accent text-accent-foreground">
                  <Rocket size={16} className="mr-2" /> Começar a Vender
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 10 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goPrev} disabled={step === 1}>
            <ChevronLeft size={16} className="mr-1" /> Voltar
          </Button>
          <Button variant="outline" onClick={() => saveProgress(false)} disabled={saving}>
            <Save size={16} className="mr-1" /> {saving ? "Salvando..." : "Salvar Progresso"}
          </Button>
          <Button onClick={goNext} disabled={saving} className="bg-accent text-accent-foreground">
            {saving ? "Salvando..." : "Próximo"} <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
