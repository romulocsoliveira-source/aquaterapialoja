import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Printer, Mail, Download, CheckCircle } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

interface SaleItem {
  product: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
    promoPrice?: number;
  };
  quantity: number;
}

interface SaleData {
  id: string;
  total: number;
  discount: number;
  method: string;
  items: SaleItem[];
  cashReceived: number;
  change: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleData;
  customerName?: string;
}

const methodLabels: Record<string, string> = {
  pix: "PIX", credit_card: "Cartão de Crédito", debit_card: "Cartão de Débito", cash: "Dinheiro",
};

function generateAccessKey() {
  return Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join("");
}

function generateNFeNumber() {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCurrency(v: number) {
  return v.toFixed(2).replace(".", ",");
}

export default function NFeSimulator({ open, onOpenChange, sale, customerName }: Props) {
  const { data: storeConfig } = useStoreConfig();
  const [emailSent, setEmailSent] = useState(false);
  const nfeNumber = generateNFeNumber();
  const series = "001";
  const accessKey = generateAccessKey();
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR");

  const companyName = storeConfig?.trade_name || storeConfig?.company_name || "AQUATERAPIA";
  const companyPhone = storeConfig?.phone || "(18) 99657-0512";
  const companyCnpj = storeConfig?.cnpj || "00.000.000/0001-00";
  const companyAddress = storeConfig?.street
    ? `${storeConfig.street}, ${storeConfig.number || "S/N"} - ${storeConfig.neighborhood || ""}, ${storeConfig.city || ""}/${storeConfig.state || ""}`
    : "Av. Getúlio Vargas, 339 – Vila Nova Santana, Assis/SP";

  const subtotal = sale.items.reduce(
    (s, i) => s + (i.product.promoPrice || i.product.price) * i.quantity, 0
  );
  const icms = subtotal * 0.18;
  const pis = subtotal * 0.0165;
  const cofins = subtotal * 0.076;

  const handlePrint = () => {
    const printContent = document.getElementById("nfe-content");
    if (!printContent) return;
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <html><head><title>NF-e ${nfeNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
        ${printContent.querySelector("style")?.textContent || ""}
        @media print { body { padding: 10px; } }
      </style></head>
      <body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownloadPDF = () => {
    handlePrint();
    toast.success("Use 'Salvar como PDF' na janela de impressão");
  };

  const handleEmailSimulate = () => {
    setEmailSent(true);
    toast.success("Nota fiscal enviada com sucesso (modo teste)");
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="font-display flex items-center gap-2">
            <FileText size={20} /> Nota Fiscal Eletrônica (Teste)
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 px-4 pb-2">
          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer size={14} /> Imprimir
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="gap-1.5 text-xs">
            <Download size={14} /> Baixar PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleEmailSimulate} disabled={emailSent} className="gap-1.5 text-xs">
            {emailSent ? <CheckCircle size={14} className="text-green-500" /> : <Mail size={14} />}
            {emailSent ? "Enviado!" : "Enviar por E-mail"}
          </Button>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold">
              ⚠ MODO TESTE — SEM VALIDADE FISCAL
            </span>
          </div>
        </div>

        <div id="nfe-content" className="mx-4 mb-4 border border-gray-800 bg-white text-black text-[11px] leading-tight">
          <style>{`
            .nfe-table { width: 100%; border-collapse: collapse; }
            .nfe-table td, .nfe-table th { border: 1px solid #000; padding: 3px 5px; text-align: left; vertical-align: top; }
            .nfe-table th { background: #f5f5f5; font-weight: bold; font-size: 9px; text-transform: uppercase; color: #333; }
            .nfe-section-title { background: #e0e0e0; font-weight: bold; font-size: 10px; padding: 3px 6px; border: 1px solid #000; text-transform: uppercase; }
            .nfe-field-label { font-size: 8px; color: #666; text-transform: uppercase; display: block; }
            .nfe-field-value { font-size: 11px; font-weight: 600; }
          `}</style>

          <div className="nfe-header" style={{ display: "flex", borderBottom: "2px solid #000" }}>
            <div style={{ flex: 1, padding: "8px", borderRight: "1px solid #000" }}>
              <p style={{ fontSize: "14px", fontWeight: "bold" }}>{companyName.toUpperCase()}</p>
              <p style={{ fontSize: "10px" }}>{companyAddress}</p>
              <p style={{ fontSize: "10px" }}>Fone: {companyPhone}</p>
            </div>
            <div style={{ width: "200px", padding: "8px", textAlign: "center", borderRight: "1px solid #000" }}>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>DANFE</p>
              <p style={{ fontSize: "8px" }}>DOCUMENTO AUXILIAR DA</p>
              <p style={{ fontSize: "8px" }}>NOTA FISCAL ELETRÔNICA</p>
              <p style={{ fontSize: "9px", marginTop: "4px" }}>0 - ENTRADA</p>
              <p style={{ fontSize: "9px", fontWeight: "bold" }}>1 - SAÍDA</p>
              <p style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>Nº {nfeNumber}</p>
              <p style={{ fontSize: "9px" }}>SÉRIE {series}</p>
            </div>
            <div style={{ width: "200px", padding: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "8px", color: "#666" }}>CHAVE DE ACESSO</p>
              <p style={{ fontSize: "9px", fontFamily: "monospace", wordBreak: "break-all", lineHeight: "1.3" }}>
                {accessKey.replace(/(.{4})/g, "$1 ").trim()}
              </p>
              <p style={{ fontSize: "8px", marginTop: "6px", color: "#666" }}>
                Consulta de autenticidade em<br />www.nfe.fazenda.gov.br
              </p>
            </div>
          </div>

          <table className="nfe-table">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>
                  <span className="nfe-field-label">Natureza da Operação</span>
                  <span className="nfe-field-value">VENDA</span>
                </td>
                <td>
                  <span className="nfe-field-label">Protocolo de Autorização</span>
                  <span className="nfe-field-value">MODO TESTE — SEM VALIDADE</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="nfe-field-label">Inscrição Estadual</span>
                  <span className="nfe-field-value">000.000.000.000</span>
                </td>
                <td>
                  <span className="nfe-field-label">CNPJ</span>
                  <span className="nfe-field-value">{companyCnpj}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="nfe-section-title">Destinatário / Remetente</div>
          <table className="nfe-table">
            <tbody>
              <tr>
                <td style={{ width: "60%" }}>
                  <span className="nfe-field-label">Nome / Razão Social</span>
                  <span className="nfe-field-value">{customerName || "CONSUMIDOR FINAL"}</span>
                </td>
                <td style={{ width: "20%" }}>
                  <span className="nfe-field-label">CPF/CNPJ</span>
                  <span className="nfe-field-value">—</span>
                </td>
                <td>
                  <span className="nfe-field-label">Data Emissão</span>
                  <span className="nfe-field-value">{dateStr}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <span className="nfe-field-label">Endereço</span>
                  <span className="nfe-field-value">—</span>
                </td>
                <td>
                  <span className="nfe-field-label">Hora Emissão</span>
                  <span className="nfe-field-value">{timeStr}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="nfe-section-title">Produtos / Serviços</div>
          <table className="nfe-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>Item</th>
                <th style={{ width: "100px" }}>Código</th>
                <th>Descrição</th>
                <th style={{ width: "40px" }}>UN</th>
                <th style={{ width: "40px" }}>Qtd</th>
                <th style={{ width: "70px" }}>Vlr Unit</th>
                <th style={{ width: "80px" }}>Vlr Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => {
                const unitPrice = item.product.promoPrice || item.product.price;
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "9px" }}>{item.product.barcode || item.product.sku}</td>
                    <td>{item.product.name}</td>
                    <td style={{ textAlign: "center" }}>UN</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(unitPrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(unitPrice * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="nfe-section-title">Cálculo do Imposto</div>
          <table className="nfe-table">
            <tbody>
              <tr>
                <td>
                  <span className="nfe-field-label">Base Cálc. ICMS</span>
                  <span className="nfe-field-value">{formatCurrency(subtotal)}</span>
                </td>
                <td>
                  <span className="nfe-field-label">Valor ICMS (18%)</span>
                  <span className="nfe-field-value">{formatCurrency(icms)}</span>
                </td>
                <td>
                  <span className="nfe-field-label">Valor PIS (1,65%)</span>
                  <span className="nfe-field-value">{formatCurrency(pis)}</span>
                </td>
                <td>
                  <span className="nfe-field-label">Valor COFINS (7,6%)</span>
                  <span className="nfe-field-value">{formatCurrency(cofins)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="nfe-table">
            <tbody>
              <tr>
                <td>
                  <span className="nfe-field-label">Valor Total dos Produtos</span>
                  <span className="nfe-field-value">{formatCurrency(subtotal)}</span>
                </td>
                {sale.discount > 0 && (
                  <td>
                    <span className="nfe-field-label">Desconto</span>
                    <span className="nfe-field-value">{formatCurrency(sale.discount)}</span>
                  </td>
                )}
                <td>
                  <span className="nfe-field-label">Valor Total da Nota</span>
                  <span className="nfe-field-value" style={{ fontSize: "14px" }}>{formatCurrency(sale.total)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="nfe-section-title">Forma de Pagamento</div>
          <table className="nfe-table">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>
                  <span className="nfe-field-label">Meio de Pagamento</span>
                  <span className="nfe-field-value">{methodLabels[sale.method] || sale.method}</span>
                </td>
                <td>
                  <span className="nfe-field-label">Valor Pago</span>
                  <span className="nfe-field-value">
                    {sale.method === "cash" && sale.cashReceived > 0
                      ? formatCurrency(sale.cashReceived)
                      : formatCurrency(sale.total)}
                  </span>
                </td>
                {sale.method === "cash" && sale.change > 0 && (
                  <td>
                    <span className="nfe-field-label">Troco</span>
                    <span className="nfe-field-value">{formatCurrency(sale.change)}</span>
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          <div className="nfe-section-title">Informações Complementares</div>
          <div style={{ padding: "6px", border: "1px solid #000", fontSize: "9px", color: "#666", minHeight: "30px" }}>
            Pedido: #{sale.id.slice(0, 8).toUpperCase()} · Emissão: {dateStr} {timeStr} ·{" "}
            DOCUMENTO SEM VALIDADE FISCAL — EMITIDO EM MODO TESTE.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
