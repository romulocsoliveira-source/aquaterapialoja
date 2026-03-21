import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, XCircle, Clock, Loader2, Save, Zap, Copy, Eye, EyeOff,
  QrCode, CreditCard, Receipt, Shield, AlertTriangle, Activity, Settings2, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

interface PaymentSettings {
  id?: string;
  environment: string;
  is_active: boolean;
  sandbox_token: string;
  production_token: string;
  webhook_url: string;
  public_key: string;
  account_reference: string;
  pix_enabled: boolean;
  pix_expiration_minutes: number;
  pix_instructions: string;
  credit_card_enabled: boolean;
  max_installments: number;
  min_installment_value: number;
  interest_on_store: boolean;
  require_cardholder_name: boolean;
  require_buyer_cpf: boolean;
  boleto_enabled: boolean;
  boleto_due_days: number;
  boleto_instructions: string;
  last_test_at: string | null;
  last_test_status: string | null;
  updated_at?: string;
}

const DEFAULT_SETTINGS: PaymentSettings = {
  environment: "sandbox",
  is_active: false,
  sandbox_token: "",
  production_token: "",
  webhook_url: "",
  public_key: "",
  account_reference: "",
  pix_enabled: true,
  pix_expiration_minutes: 30,
  pix_instructions: "Pague via PIX para confirmar seu pedido.",
  credit_card_enabled: false,
  max_installments: 12,
  min_installment_value: 10,
  interest_on_store: true,
  require_cardholder_name: true,
  require_buyer_cpf: true,
  boleto_enabled: false,
  boleto_due_days: 3,
  boleto_instructions: "Pague o boleto até o vencimento para confirmar seu pedido.",
  last_test_at: null,
  last_test_status: null,
};

export default function AdminPaymentSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSandboxToken, setShowSandboxToken] = useState(false);
  const [showProdToken, setShowProdToken] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [gatewayLogs, setGatewayLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/pagbank-webhook`;

  useEffect(() => {
    loadSettings();
  }, []);

  const callPagbankApi = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão expirada");
    const resp = await fetch(
      `https://${projectId}.supabase.co/functions/v1/pagbank-api`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
      }
    );
    return resp.json();
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await callPagbankApi({ action: "get-settings" });
      if (data.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (e: any) {
      console.error("Erro ao carregar:", e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await callPagbankApi({ action: "save-settings", settings });
      if (result.success) {
        toast.success("Configurações salvas com sucesso!");
        await loadSettings();
      } else {
        toast.error(result.error || "Erro ao salvar");
      }
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await callPagbankApi({ action: "test-connection" });
      if (result.success) {
        toast.success(result.message);
        if (result.public_key) {
          setSettings(s => ({ ...s, public_key: result.public_key, last_test_status: "success", last_test_at: new Date().toISOString() }));
        }
      } else {
        toast.error(result.message || result.error);
        setSettings(s => ({ ...s, last_test_status: "error", last_test_at: new Date().toISOString() }));
      }
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
    setTesting(false);
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await callPagbankApi({ action: "get-logs" });
      setWebhookLogs(data.webhookLogs || []);
      setGatewayLogs(data.gatewayLogs || []);
    } catch (e: any) {
      toast.error("Erro ao carregar logs");
    }
    setLogsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const handleActivateProduction = () => {
    if (!settings.production_token || settings.production_token.startsWith("••••")) {
      toast.error("Configure o token de produção antes de ativar.");
      return;
    }
    if (confirm("Tem certeza que deseja ativar o ambiente de PRODUÇÃO? Pagamentos reais serão processados.")) {
      setSettings(s => ({ ...s, environment: "production", is_active: true }));
      toast.info("Ambiente alterado para Produção. Clique em Salvar para confirmar.");
    }
  };

  const getStatusInfo = () => {
    if (!settings.id && !settings.sandbox_token && !settings.production_token) {
      return { label: "Não configurado", color: "text-muted-foreground", icon: Clock, bg: "bg-muted" };
    }
    if (settings.last_test_status === "error") {
      return { label: "Erro de autenticação", color: "text-destructive", icon: XCircle, bg: "bg-destructive/10" };
    }
    if (!settings.is_active) {
      return { label: settings.environment === "sandbox" ? "Sandbox (inativo)" : "Produção (inativo)", color: "text-yellow-500", icon: AlertTriangle, bg: "bg-yellow-500/10" };
    }
    if (settings.environment === "sandbox") {
      return { label: "Sandbox (ativo)", color: "text-blue-500", icon: Zap, bg: "bg-blue-500/10" };
    }
    return { label: "Produção (ativo)", color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500/10" };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  const status = getStatusInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <CreditCard className="text-primary" size={24} />
            Configurações de Pagamento
          </h2>
          <p className="text-sm text-muted-foreground">Integração PagBank — configure e gerencie pagamentos.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Configurações
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status.bg}`}>
                  <status.icon size={20} className={status.color} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ambiente</p>
                  <p className="text-sm font-semibold">{settings.environment === "production" ? "Produção" : "Sandbox"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Activity size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Último teste</p>
                  <p className="text-sm font-semibold">
                    {settings.last_test_at ? new Date(settings.last_test_at).toLocaleString("pt-BR") : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.is_active ? "bg-green-500/10" : "bg-muted"}`}>
                  <Zap size={20} className={settings.is_active ? "text-green-500" : "text-muted-foreground"} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gateway</p>
                  <p className="text-sm font-semibold">{settings.is_active ? "Ativo" : "Inativo"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="credentials" className="gap-1.5"><Shield size={14} />Credenciais</TabsTrigger>
          <TabsTrigger value="methods" className="gap-1.5"><CreditCard size={14} />Métodos</TabsTrigger>
          <TabsTrigger value="pix" className="gap-1.5"><QrCode size={14} />PIX</TabsTrigger>
          <TabsTrigger value="card" className="gap-1.5"><CreditCard size={14} />Cartão</TabsTrigger>
          <TabsTrigger value="boleto" className="gap-1.5"><Receipt size={14} />Boleto</TabsTrigger>
          <TabsTrigger value="webhook" className="gap-1.5"><Activity size={14} />Webhook</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5" onClick={loadLogs}><Settings2 size={14} />Logs</TabsTrigger>
        </TabsList>

        {/* Credentials */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credenciais PagBank</CardTitle>
              <CardDescription>Configure os tokens de autenticação para sandbox e produção.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Ambiente ativo:</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={settings.environment === "sandbox" ? "default" : "outline"}
                    onClick={() => setSettings(s => ({ ...s, environment: "sandbox" }))}
                  >Sandbox</Button>
                  <Button
                    size="sm"
                    variant={settings.environment === "production" ? "default" : "outline"}
                    onClick={handleActivateProduction}
                  >Produção</Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={settings.is_active} onCheckedChange={v => setSettings(s => ({ ...s, is_active: v }))} />
                <Label>Gateway ativo (processar pagamentos reais)</Label>
              </div>

              <div className="space-y-1">
                <Label>Token Sandbox</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSandboxToken ? "text" : "password"}
                    value={settings.sandbox_token}
                    onChange={e => setSettings(s => ({ ...s, sandbox_token: e.target.value }))}
                    placeholder="Token do ambiente sandbox"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setShowSandboxToken(!showSandboxToken)}>
                    {showSandboxToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Token Produção</Label>
                <div className="flex gap-2">
                  <Input
                    type={showProdToken ? "text" : "password"}
                    value={settings.production_token}
                    onChange={e => setSettings(s => ({ ...s, production_token: e.target.value }))}
                    placeholder="Token do ambiente de produção"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setShowProdToken(!showProdToken)}>
                    {showProdToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Chave Pública (preenchida automaticamente após teste)</Label>
                <Input value={settings.public_key} readOnly placeholder="Gerada automaticamente" className="bg-muted" />
              </div>

              <div className="space-y-1">
                <Label>Referência da Conta</Label>
                <Input
                  value={settings.account_reference}
                  onChange={e => setSettings(s => ({ ...s, account_reference: e.target.value }))}
                  placeholder="Ex: AQUATERAPIA"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleTest} disabled={testing} variant="outline" className="gap-2">
                  {testing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Testar Conexão
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methods toggles */}
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
              <CardDescription>Ative ou desative os métodos disponíveis no checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <QrCode className="text-green-500" size={24} />
                  <div>
                    <p className="font-semibold">PIX</p>
                    <p className="text-xs text-muted-foreground">Pagamento instantâneo via QR Code</p>
                  </div>
                </div>
                <Switch checked={settings.pix_enabled} onCheckedChange={v => setSettings(s => ({ ...s, pix_enabled: v }))} />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-blue-500" size={24} />
                  <div>
                    <p className="font-semibold">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Pagamento parcelado com tokenização segura</p>
                  </div>
                </div>
                <Switch checked={settings.credit_card_enabled} onCheckedChange={v => setSettings(s => ({ ...s, credit_card_enabled: v }))} />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <Receipt className="text-orange-500" size={24} />
                  <div>
                    <p className="font-semibold">Boleto Bancário</p>
                    <p className="text-xs text-muted-foreground">Pagamento via boleto com vencimento</p>
                  </div>
                </div>
                <Switch checked={settings.boleto_enabled} onCheckedChange={v => setSettings(s => ({ ...s, boleto_enabled: v }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIX Config */}
        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações PIX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={settings.pix_enabled} onCheckedChange={v => setSettings(s => ({ ...s, pix_enabled: v }))} />
                <Label>PIX habilitado</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tempo de expiração (minutos)</Label>
                  <Input
                    type="number"
                    value={settings.pix_expiration_minutes}
                    onChange={e => setSettings(s => ({ ...s, pix_expiration_minutes: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Instruções ao cliente</Label>
                <textarea
                  value={settings.pix_instructions}
                  onChange={e => setSettings(s => ({ ...s, pix_instructions: e.target.value }))}
                  className="w-full mt-1 bg-secondary text-foreground px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Config */}
        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações Cartão de Crédito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={settings.credit_card_enabled} onCheckedChange={v => setSettings(s => ({ ...s, credit_card_enabled: v }))} />
                <Label>Cartão de crédito habilitado</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Máximo de parcelas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={18}
                    value={settings.max_installments}
                    onChange={e => setSettings(s => ({ ...s, max_installments: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Valor mínimo da parcela (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.min_installment_value}
                    onChange={e => setSettings(s => ({ ...s, min_installment_value: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={settings.interest_on_store} onCheckedChange={v => setSettings(s => ({ ...s, interest_on_store: v }))} />
                  <Label>Juros por conta da loja (sem juros para o cliente)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={settings.require_cardholder_name} onCheckedChange={v => setSettings(s => ({ ...s, require_cardholder_name: v }))} />
                  <Label>Exigir nome do portador do cartão</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={settings.require_buyer_cpf} onCheckedChange={v => setSettings(s => ({ ...s, require_buyer_cpf: v }))} />
                  <Label>Exigir CPF do comprador</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boleto Config */}
        <TabsContent value="boleto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações Boleto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={settings.boleto_enabled} onCheckedChange={v => setSettings(s => ({ ...s, boleto_enabled: v }))} />
                <Label>Boleto habilitado</Label>
              </div>
              <div>
                <Label>Dias para vencimento</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.boleto_due_days}
                  onChange={e => setSettings(s => ({ ...s, boleto_due_days: Number(e.target.value) }))}
                  className="mt-1 max-w-[200px]"
                />
              </div>
              <div>
                <Label>Instruções no boleto</Label>
                <textarea
                  value={settings.boleto_instructions}
                  onChange={e => setSettings(s => ({ ...s, boleto_instructions: e.target.value }))}
                  className="w-full mt-1 bg-secondary text-foreground px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webhook PagBank</CardTitle>
              <CardDescription>Configure a URL de notificações para atualização automática de status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL do Webhook (copie e cole no painel PagBank)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={webhookUrl} readOnly className="bg-muted font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
                <p className="font-semibold">Como configurar:</p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                  <li>Acesse o painel PagBank → Configurações → Notificações</li>
                  <li>Cole a URL acima no campo de notificação</li>
                  <li>Selecione os eventos: pagamento aprovado, cancelado, estornado</li>
                  <li>Salve as configurações no PagBank</li>
                </ol>
              </div>
              <div className="bg-blue-500/10 text-blue-500 rounded-lg p-3 text-xs flex items-start gap-2">
                <Shield size={16} className="mt-0.5 shrink-0" />
                <p>O webhook processa automaticamente: confirmações de PIX, aprovações de cartão, pagamentos de boleto, cancelamentos e estornos.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Logs e Diagnóstico</CardTitle>
                  <CardDescription>Histórico de operações e notificações PagBank.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadLogs} disabled={logsLoading} className="gap-2">
                  {logsLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gateway">
                <TabsList>
                  <TabsTrigger value="gateway">API Gateway ({gatewayLogs.length})</TabsTrigger>
                  <TabsTrigger value="webhook">Webhook ({webhookLogs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="gateway" className="mt-4">
                  {gatewayLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">Nenhum log registrado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {gatewayLogs.map((log: any) => (
                        <div key={log.id} className={`p-3 rounded-lg border text-xs ${log.success ? "border-green-500/20 bg-green-500/5" : "border-destructive/20 bg-destructive/5"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold font-mono">{log.action}</span>
                            <div className="flex items-center gap-2">
                              {log.status_code > 0 && <span className="text-muted-foreground">HTTP {log.status_code}</span>}
                              {log.success ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-destructive" />}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</p>
                          {log.error_message && <p className="text-destructive mt-1">{log.error_message}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="webhook" className="mt-4">
                  {webhookLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma notificação recebida.</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {webhookLogs.map((log: any) => (
                        <div key={log.id} className={`p-3 rounded-lg border text-xs ${log.processed ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold font-mono">{log.event_type}</span>
                            <div className="flex items-center gap-2">
                              {log.status && <span className="bg-secondary px-2 py-0.5 rounded">{log.status}</span>}
                              {log.processed ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-yellow-500" />}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</p>
                          {log.transaction_id && <p className="text-muted-foreground">TX: {log.transaction_id}</p>}
                          {log.error_message && <p className="text-destructive mt-1">{log.error_message}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
