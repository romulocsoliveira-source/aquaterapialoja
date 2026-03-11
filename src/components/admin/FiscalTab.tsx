import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Eye, Search, XCircle, CheckCircle,
  Clock, AlertTriangle, Printer, Send, Filter
} from "lucide-react";
import { motion } from "framer-motion";

interface FiscalInvoice {
  id: string;
  order_id: string | null;
  invoice_type: string;
  invoice_number: string | null;
  series: string;
  access_key: string | null;
  status: string;
  customer_name: string | null;
  customer_cpf: string | null;
  total_amount: number;
  discount_amount: number;
  tax_icms: number;
  tax_pis: number;
  tax_cofins: number;
  payment_method: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  authorized_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  authorized: { label: "Autorizada", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-red-500/20 text-red-400", icon: XCircle },
  rejected: { label: "Rejeitada", color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
};

export default function FiscalTab() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<FiscalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showEmitForm, setShowEmitForm] = useState(false);
  const [emitLoading, setEmitLoading] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<FiscalInvoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  const [emitForm, setEmitForm] = useState({
    invoice_type: "nfe",
    customer_name: "",
    customer_cpf: "",
    total_amount: "",
    discount_amount: "0",
    payment_method: "pix",
    notes: "",
  });

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("fiscal_invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setInvoices((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const generateInvoiceNumber = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  };

  const generateAccessKey = () => {
    const chars = "0123456789";
    let key = "";
    for (let i = 0; i < 44; i++) key += chars[Math.floor(Math.random() * chars.length)];
    return key;
  };

  const handleEmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !emitForm.customer_name || !emitForm.total_amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setEmitLoading(true);
    const totalAmount = Number(emitForm.total_amount);
    const discountAmount = Number(emitForm.discount_amount) || 0;
    const taxIcms = totalAmount * 0.18;
    const taxPis = totalAmount * 0.0165;
    const taxCofins = totalAmount * 0.076;

    const invoiceNumber = generateInvoiceNumber();
    const accessKey = generateAccessKey();

    const { error } = await supabase.from("fiscal_invoices").insert({
      invoice_type: emitForm.invoice_type,
      invoice_number: invoiceNumber,
      access_key: accessKey,
      status: "authorized",
      authorized_at: new Date().toISOString(),
      customer_name: emitForm.customer_name,
      customer_cpf: emitForm.customer_cpf || null,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      tax_icms: Number(taxIcms.toFixed(2)),
      tax_pis: Number(taxPis.toFixed(2)),
      tax_cofins: Number(taxCofins.toFixed(2)),
      payment_method: emitForm.payment_method,
      notes: emitForm.notes || null,
      created_by: user.id,
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${emitForm.invoice_type === "nfe" ? "NF-e" : "NFC-e"} emitida com sucesso!`);
      setShowEmitForm(false);
      setEmitForm({ invoice_type: "nfe", customer_name: "", customer_cpf: "", total_amount: "", discount_amount: "0", payment_method: "pix", notes: "" });
      fetchInvoices();
    }
    setEmitLoading(false);
  };

  const handleCancel = async () => {
    if (!showCancelModal || !cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }

    const { error } = await supabase.from("fiscal_invoices").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancelReason,
    } as any).eq("id", showCancelModal);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Nota fiscal cancelada");
      setShowCancelModal(null);
      setCancelReason("");
      fetchInvoices();
    }
  };

  const printDANFE = (invoice: FiscalInvoice) => {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;

    const typeName = invoice.invoice_type === "nfe" ? "NF-e" : "NFC-e";
    const statusLabel = statusConfig[invoice.status]?.label || invoice.status;

    win.document.write(`
      <html><head><title>DANFE - ${typeName} ${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
        .header { border: 2px solid #000; padding: 15px; margin-bottom: 10px; text-align: center; }
        .header h1 { font-size: 18px; margin: 0; }
        .header h2 { font-size: 14px; margin: 5px 0; color: #333; }
        .section { border: 1px solid #000; padding: 10px; margin-bottom: 8px; }
        .section-title { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .label { color: #666; font-size: 10px; }
        .value { font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; text-align: right; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
        .barcode { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 2px; margin: 15px 0; padding: 10px; border: 1px dashed #ccc; }
        .footer { text-align: center; font-size: 9px; color: #666; margin-top: 20px; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .status-authorized { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-pending { background: #fff3cd; color: #856404; }
        @media print { body { margin: 0; } }
      </style></head><body>
        <div class="header">
          <h1>ALMOXARIFADO DAS TINTAS</h1>
          <h2>DOCUMENTO AUXILIAR DA ${typeName}</h2>
          <p>(18) 3323-1220</p>
        </div>

        <div class="section">
          <div class="section-title">Informações da Nota</div>
          <div class="row"><span class="label">Tipo:</span><span class="value">${typeName}</span></div>
          <div class="row"><span class="label">Número:</span><span class="value">${invoice.invoice_number || "—"}</span></div>
          <div class="row"><span class="label">Série:</span><span class="value">${invoice.series || "1"}</span></div>
          <div class="row"><span class="label">Data Emissão:</span><span class="value">${new Date(invoice.created_at).toLocaleString("pt-BR")}</span></div>
          <div class="row"><span class="label">Status:</span><span class="status status-${invoice.status}">${statusLabel}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Destinatário</div>
          <div class="row"><span class="label">Nome:</span><span class="value">${invoice.customer_name || "Consumidor Final"}</span></div>
          ${invoice.customer_cpf ? `<div class="row"><span class="label">CPF/CNPJ:</span><span class="value">${invoice.customer_cpf}</span></div>` : ""}
        </div>

        <div class="section">
          <div class="section-title">Valores</div>
          <div class="row"><span class="label">Valor dos Produtos:</span><span class="value">${formatPrice(invoice.total_amount + invoice.discount_amount)}</span></div>
          ${invoice.discount_amount > 0 ? `<div class="row"><span class="label">Desconto:</span><span class="value">-${formatPrice(invoice.discount_amount)}</span></div>` : ""}
          <div class="row"><span class="label">ICMS:</span><span class="value">${formatPrice(invoice.tax_icms)}</span></div>
          <div class="row"><span class="label">PIS:</span><span class="value">${formatPrice(invoice.tax_pis)}</span></div>
          <div class="row"><span class="label">COFINS:</span><span class="value">${formatPrice(invoice.tax_cofins)}</span></div>
          <div class="total">TOTAL: ${formatPrice(invoice.total_amount)}</div>
        </div>

        <div class="section">
          <div class="section-title">Pagamento</div>
          <div class="row"><span class="label">Forma:</span><span class="value">${invoice.payment_method || "—"}</span></div>
        </div>

        ${invoice.access_key ? `
        <div class="barcode">
          <div class="section-title" style="text-align:center">Chave de Acesso</div>
          ${invoice.access_key}
        </div>
        ` : ""}

        ${invoice.notes ? `<div class="section"><div class="section-title">Observações</div><p>${invoice.notes}</p></div>` : ""}

        <div class="footer">
          <p>Documento auxiliar da ${typeName} - Sem valor fiscal para fins de auditoria</p>
          <p>Almoxarifado das Tintas - Sistema Fiscal Integrado</p>
        </div>
        <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  const downloadXML = (invoice: FiscalInvoice) => {
    const typeName = invoice.invoice_type === "nfe" ? "NF-e" : "NFC-e";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${invoice.access_key || ""}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <natOp>Venda de Mercadoria</natOp>
        <mod>${invoice.invoice_type === "nfe" ? "55" : "65"}</mod>
        <serie>${invoice.series || "1"}</serie>
        <nNF>${invoice.invoice_number || ""}</nNF>
        <dhEmi>${invoice.created_at}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <xNome>ALMOXARIFADO DAS TINTAS</xNome>
        <xFone>1833231220</xFone>
      </emit>
      <dest>
        <xNome>${invoice.customer_name || "CONSUMIDOR FINAL"}</xNome>
        ${invoice.customer_cpf ? `<CPF>${invoice.customer_cpf.replace(/\D/g, "")}</CPF>` : ""}
      </dest>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>${invoice.tax_icms.toFixed(2)}</vICMS>
          <vPIS>${invoice.tax_pis.toFixed(2)}</vPIS>
          <vCOFINS>${invoice.tax_cofins.toFixed(2)}</vCOFINS>
          <vDesc>${(invoice.discount_amount || 0).toFixed(2)}</vDesc>
          <vNF>${invoice.total_amount.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <pag>
        <detPag>
          <tPag>${invoice.payment_method === "pix" ? "17" : invoice.payment_method === "credit_card" ? "03" : invoice.payment_method === "debit_card" ? "04" : "01"}</tPag>
          <vPag>${invoice.total_amount.toFixed(2)}</vPag>
        </detPag>
      </pag>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <chNFe>${invoice.access_key || ""}</chNFe>
      <dhRecbto>${invoice.authorized_at || invoice.created_at}</dhRecbto>
      <nProt>${invoice.invoice_number || ""}</nProt>
      <cStat>${invoice.status === "authorized" ? "100" : "0"}</cStat>
      <xMotivo>${invoice.status === "authorized" ? "Autorizado o uso da ${typeName}" : "Pendente"}</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typeName}_${invoice.invoice_number || invoice.id.slice(0, 8)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("XML baixado!");
  };

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (typeFilter !== "all" && inv.invoice_type !== typeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (inv.invoice_number || "").includes(term) ||
        (inv.customer_name || "").toLowerCase().includes(term) ||
        (inv.customer_cpf || "").includes(term) ||
        (inv.access_key || "").includes(term)
      );
    }
    return true;
  });

  const stats = {
    total: invoices.length,
    authorized: invoices.filter(i => i.status === "authorized").length,
    pending: invoices.filter(i => i.status === "pending").length,
    cancelled: invoices.filter(i => i.status === "cancelled").length,
    totalValue: invoices.filter(i => i.status === "authorized").reduce((s, i) => s + Number(i.total_amount), 0),
  };

  const paymentLabels: Record<string, string> = {
    pix: "Pix", credit_card: "Cartão Crédito", debit_card: "Cartão Débito", cash: "Dinheiro", boleto: "Boleto",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Emitidas", value: stats.total, icon: FileText, color: "text-accent" },
          { label: "Autorizadas", value: stats.authorized, icon: CheckCircle, color: "text-green-400" },
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { label: "Canceladas", value: stats.cancelled, icon: XCircle, color: "text-red-400" },
          { label: "Faturamento NF", value: formatPrice(stats.totalValue), icon: FileText, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4">
            <s.icon size={18} className={s.color} />
            <p className="text-lg font-bold mt-2">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowEmitForm(!showEmitForm)} className="gradient-gold text-primary-foreground font-body text-sm gap-2">
          <FileText size={16} /> Emitir Nota Fiscal
        </Button>
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por número, cliente, CPF..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-secondary text-foreground px-3 py-2 rounded-lg text-xs focus:outline-none">
            <option value="all">Todos Status</option>
            <option value="authorized">Autorizadas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-secondary text-foreground px-3 py-2 rounded-lg text-xs focus:outline-none">
            <option value="all">Todos Tipos</option>
            <option value="nfe">NF-e</option>
            <option value="nfce">NFC-e</option>
          </select>
        </div>
      </div>

      {/* Emit form */}
      {showEmitForm && (
        <motion.form onSubmit={handleEmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display text-lg font-bold">Emitir Nota Fiscal</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Tipo *</label>
              <select value={emitForm.invoice_type} onChange={e => setEmitForm(f => ({ ...f, invoice_type: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="nfe">NF-e (Nota Fiscal Eletrônica)</option>
                <option value="nfce">NFC-e (Cupom Fiscal)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Cliente *</label>
              <Input value={emitForm.customer_name} onChange={e => setEmitForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Nome do cliente" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CPF/CNPJ</label>
              <Input value={emitForm.customer_cpf} onChange={e => setEmitForm(f => ({ ...f, customer_cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Valor Total *</label>
              <Input type="number" step="0.01" value={emitForm.total_amount} onChange={e => setEmitForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="0.00" required />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Desconto</label>
              <Input type="number" step="0.01" value={emitForm.discount_amount} onChange={e => setEmitForm(f => ({ ...f, discount_amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Pagamento</label>
              <select value={emitForm.payment_method} onChange={e => setEmitForm(f => ({ ...f, payment_method: e.target.value }))} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="pix">Pix</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="cash">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Observações</label>
              <Input value={emitForm.notes} onChange={e => setEmitForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações..." />
            </div>
          </div>
          {emitForm.total_amount && (
            <div className="bg-secondary rounded-lg p-3 text-sm space-y-1">
              <p className="text-muted-foreground">Impostos estimados:</p>
              <div className="grid grid-cols-3 gap-4">
                <div><span className="text-xs text-muted-foreground">ICMS (18%): </span><span className="font-bold">{formatPrice(Number(emitForm.total_amount) * 0.18)}</span></div>
                <div><span className="text-xs text-muted-foreground">PIS (1.65%): </span><span className="font-bold">{formatPrice(Number(emitForm.total_amount) * 0.0165)}</span></div>
                <div><span className="text-xs text-muted-foreground">COFINS (7.6%): </span><span className="font-bold">{formatPrice(Number(emitForm.total_amount) * 0.076)}</span></div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={emitLoading} className="gradient-gold text-primary-foreground gap-2">
              {emitLoading ? "Emitindo..." : <><Send size={14} /> Emitir Nota</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEmitForm(false)}>Cancelar</Button>
          </div>
        </motion.form>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={() => setShowCancelModal(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><XCircle size={20} className="text-destructive" /> Cancelar Nota Fiscal</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Motivo do cancelamento *</label>
                <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 mt-1" rows={3} placeholder="Informe o motivo..." />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCancel} variant="destructive" className="gap-2"><XCircle size={14} /> Confirmar Cancelamento</Button>
                <Button variant="outline" onClick={() => { setShowCancelModal(null); setCancelReason(""); }}>Voltar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice detail modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={() => setViewingInvoice(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold">Detalhes da Nota</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[viewingInvoice.status]?.color}`}>
                {statusConfig[viewingInvoice.status]?.label}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Tipo:</span> <span className="font-bold">{viewingInvoice.invoice_type === "nfe" ? "NF-e" : "NFC-e"}</span></div>
                <div><span className="text-muted-foreground">Número:</span> <span className="font-bold">{viewingInvoice.invoice_number || "—"}</span></div>
                <div><span className="text-muted-foreground">Série:</span> <span className="font-bold">{viewingInvoice.series}</span></div>
                <div><span className="text-muted-foreground">Data:</span> <span className="font-bold">{new Date(viewingInvoice.created_at).toLocaleString("pt-BR")}</span></div>
              </div>
              <div className="border-t border-border pt-3">
                <div><span className="text-muted-foreground">Cliente:</span> <span className="font-bold">{viewingInvoice.customer_name || "Consumidor Final"}</span></div>
                {viewingInvoice.customer_cpf && <div><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-bold">{viewingInvoice.customer_cpf}</span></div>}
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Valor Total</span><span className="font-bold">{formatPrice(viewingInvoice.total_amount)}</span></div>
                {viewingInvoice.discount_amount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span className="text-green-400">-{formatPrice(viewingInvoice.discount_amount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">ICMS</span><span>{formatPrice(viewingInvoice.tax_icms)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PIS</span><span>{formatPrice(viewingInvoice.tax_pis)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">COFINS</span><span>{formatPrice(viewingInvoice.tax_cofins)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span>{paymentLabels[viewingInvoice.payment_method || ""] || viewingInvoice.payment_method}</span></div>
              </div>
              {viewingInvoice.access_key && (
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground text-xs">Chave de Acesso:</span>
                  <p className="font-mono text-xs break-all mt-1">{viewingInvoice.access_key}</p>
                </div>
              )}
              {viewingInvoice.cancellation_reason && (
                <div className="border-t border-border pt-3 bg-destructive/10 rounded-lg p-3">
                  <span className="text-xs font-bold text-destructive">Motivo do cancelamento:</span>
                  <p className="text-xs mt-1">{viewingInvoice.cancellation_reason}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => printDANFE(viewingInvoice)} className="gap-1"><Printer size={14} /> DANFE</Button>
              <Button variant="outline" size="sm" onClick={() => downloadXML(viewingInvoice)} className="gap-1"><Download size={14} /> XML</Button>
              {viewingInvoice.status === "authorized" && (
                <Button variant="outline" size="sm" onClick={() => { setViewingInvoice(null); setShowCancelModal(viewingInvoice.id); }} className="gap-1 text-destructive hover:text-destructive"><XCircle size={14} /> Cancelar</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewingInvoice(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Número</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground">Tipo</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Data</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Valor</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma nota fiscal encontrada</td></tr>
              ) : filteredInvoices.map(inv => {
                const cfg = statusConfig[inv.status] || statusConfig.pending;
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-mono text-xs">{inv.invoice_number || inv.id.slice(0, 8)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${inv.invoice_type === "nfe" ? "bg-blue-500/20 text-blue-400" : "bg-accent/20 text-accent"}`}>
                        {inv.invoice_type === "nfe" ? "NF-e" : "NFC-e"}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">{inv.customer_name || "Consumidor Final"}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(inv.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(inv.total_amount)}</td>
                    <td className="p-3 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewingInvoice(inv)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Ver detalhes"><Eye size={14} /></button>
                        <button onClick={() => printDANFE(inv)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Imprimir DANFE"><Printer size={14} /></button>
                        <button onClick={() => downloadXML(inv)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Baixar XML"><Download size={14} /></button>
                        {inv.status === "authorized" && (
                          <button onClick={() => setShowCancelModal(inv.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive" title="Cancelar"><XCircle size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
          {filteredInvoices.length} nota(s) fiscal(is) · Integração SEFAZ preparada para ativação
        </div>
      </div>
    </div>
  );
}
